using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using System.IO;

namespace ScheduledCloudServiceDeployment.Test
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TesttMethod1()
        {
            var certificate = ConfigurationManager.AppSettings["SubscriptionCertificate"];
            X509Certificate2 cert = new X509Certificate2(Convert.FromBase64String(certificate), "", X509KeyStorageFlags.Exportable);

            File.WriteAllBytes(@"c:\users\skp\documents\cert.pfx", cert.Export(X509ContentType.Pfx));
        }
    }
}
