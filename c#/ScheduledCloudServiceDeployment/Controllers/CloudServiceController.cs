using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Common.Internals;
using Microsoft.WindowsAzure.Management.Compute.Models;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace ScheduledCloudServiceDeployment.Controllers
{
    /// <summary>
    /// Web API controller that starts a new deployment of a cloud service. 
    /// </summary>
    [RoutePrefix("cloudservice")]
    public class CloudServiceController : ApiController
    {
        /// <summary>
        /// Windows Azure Management Certificate
        /// </summary>
        private X509Certificate2 certificate;
        /// <summary>
        /// Subscription Id for the windows azure account
        /// </summary>
        private string subscriptionId;
        /// <summary>
        /// Cancellation token, used to cancel deployment.
        /// </summary>
        private CancellationTokenSource token;
        /// <summary>
        /// Compute services management client.
        /// </summary>
        private Microsoft.WindowsAzure.Management.Compute.ComputeManagementClient client;

        /// <summary>
        /// Client for accessing blob storage.
        /// </summary>
        private CloudBlobClient blobClient;
        private CloudStorageAccount storageAccount; 

        public CloudServiceController()
        {           
            this.token = new CancellationTokenSource();
            this.subscriptionId = ConfigurationManager.AppSettings["SubscriptionId"];
            

            var certificateString = ConfigurationManager.AppSettings["SubscriptionCertificate"];
            this.certificate = new X509Certificate2(Convert.FromBase64String(certificateString), ""); //This line will not work in a Azure Website, as it requires access to the certificate store. 
            var cred = new CertificateCloudCredentials(subscriptionId, certificate);
            this.client = CloudContext.Clients.CreateComputeManagementClient(cred);
            this.storageAccount = CloudStorageAccount.Parse(ConfigurationManager.AppSettings["DataConnectionString"]);
            this.blobClient = storageAccount.CreateCloudBlobClient();
        }

        /// <summary>
        /// Creates a new production deployment in the cloud service with the name specified
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("{name}/Create")]
        public Task<bool> CreateDeployment(string name)
        {
            using(var ms = new MemoryStream())
            {
                //Point this url to your configuraton
                DownloadFromBlobStorage(new Uri("https://cvr.blob.core.windows.net/deployments/ServiceConfiguration.Cloud.cscfg"), ms);
                ms.Position = 0;
                string clouddeploymentConfig = new StreamReader(ms).ReadToEnd();
                //Point this url to your deployment package
                return CreateDeployment(name, "https://cvr.blob.core.windows.net/deployments/CVRApi.Worker.cspkg", clouddeploymentConfig);
            }

        }

        /// <summary>
        /// Download from blob storage to stream. 
        /// </summary>
        /// <param name="blobUri"></param>
        /// <param name="stream"></param>
        private void DownloadFromBlobStorage(Uri blobUri, Stream stream)
        {
            var blobReference = blobClient.GetBlobReferenceFromServer(blobUri);
            blobReference.DownloadToStream(stream);
        }

        /// <summary>
        /// Initials the cloud service deployment
        /// </summary>
        /// <param name="serviceName">Name of the cloud service to deploy to.</param>
        /// <param name="packageUrl">The url to the deployment package.</param>
        /// <param name="configuration">The configuration file content.</param>
        /// <returns></returns>
        private async Task<bool> CreateDeployment(string serviceName, string packageUrl, string configuration)
        {
            var task = await client.Deployments.CreateAsync(serviceName, DeploymentSlot.Production, new DeploymentCreateParameters
            {
                Configuration = configuration,
                PackageUri = new Uri(packageUrl),
                StartDeployment = true,
                Label = "Autodeployment-" + serviceName + Guid.NewGuid(),
                Name = "Autodeployment" + serviceName + DateTime.Now.ToString("yyyyMMdd-HH-mm-ss")
            }, token.Token);
            return task.Status == OperationStatus.Succeeded;
        }
    }
}
