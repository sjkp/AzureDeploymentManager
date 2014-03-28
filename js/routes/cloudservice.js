var computeManagement = require('azure-mgmt-compute');
var fs = require('fs');
var azure = require('azure');

var computeManagementClient = computeManagement.createComputeManagementClient(computeManagement.createCertificateCloudCredentials({
    subscriptionId: '3f09c367-93e0-4b61-bbe5-dcb5c686bf8a',
    pem: fs.readFileSync('Pay-As-You-Go.pem').toString()
}));

var d = require('domain').create();
    

exports.list = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing deployed');
    });

    // catch the uncaught errors in this asynchronous or synchronous code block
    d.run(function () {
    // the asynchronous or synchronous code that we want to catch thrown errors on
    computeManagementClient.deployments.getBySlot(req.params.id, 'Production', function (err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send(result);
        }
    });
});
   
};


exports.delete = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing to delete');
    });
    d.run(function() {
        computeManagementClient.deployments.deleteBySlot(req.params.id, 'Production', function(err, result) {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        });
    });
};

exports.deploy = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Deployment failed');
    });
    d.run(function() {
        var blobService = azure.createBlobService();

        blobService.getBlobToText('deployments', 'ServiceConfiguration.Cloud.cscfg', function(error, config, blockBlob, response) {
            if (!error) {
                var i = config.indexOf('<'); //remove windows BOM.
                console.log(config);

                computeManagementClient.deployments.beginCreating(req.params.id, 'Production', {
                    name: 'cvrProd',
                    packageUri: 'https://cvr.blob.core.windows.net/deployments/CVRApi.Worker.cspkg',
                    label: 'nodejsdeployment',
                    configuration: config.substring(i),
                    startDeployment: true
                }, function(err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        });

    });
};

//exports.list = function(req, res) {
//    createClient(function(client) {
//        client.listHostedServices(function(err, data) {
//            res.send(data.body);
//        });

//    });
//};