
var parser = require('azure-publishsettings-parser');
var azure = require('azure');
var computeManagement = require('azure-mgmt-compute');
var fs = require('fs');
function createClient(cb) {
    parser.loadFromFile('Subscription-1-Pay-As-You-Go-3-25-2014-credentials.publishsettings', function(err, subscriptions) {
        var client = null;
        subscriptions.forEach(function(subscription) {
            if (subscription.Name === 'Pay-As-You-Go') {
                client = parser.createServiceManagementService(azure, subscription);
                return;
            }
        });
        cb(client);
    });
}

exports.list = function(req, res) {
    var computeManagementClient = computeManagement.createComputeManagementClient(computeManagement.createCertificateCloudCredentials({
        subscriptionId: '3f09c367-93e0-4b61-bbe5-dcb5c686bf8a',
        pem: fs.readFileSync('Pay-As-You-Go.pem').toString()
    }));
    computeManagementClient.deployments.getBySlot('cvr', 'Production', function(err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send(result);
        }
    });
};


exports.delete = function(req, res) {
    var computeManagementClient = computeManagement.createComputeManagementClient(computeManagement.createCertificateCloudCredentials({
        subscriptionId: '3f09c367-93e0-4b61-bbe5-dcb5c686bf8a',
        pem: fs.readFileSync('Pay-As-You-Go.pem').toString()
    }));
    computeManagementClient.deployments.deleteBySlot('cvr', 'Production', function(err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send(result);
        }
    });
};

exports.deploy = function(req, res) {
    var computeManagementClient = computeManagement.createComputeManagementClient(computeManagement.createCertificateCloudCredentials({
        subscriptionId: '3f09c367-93e0-4b61-bbe5-dcb5c686bf8a',
        pem: fs.readFileSync('Pay-As-You-Go.pem').toString()
    }));
    computeManagementClient.deployments.beginCreating('cvr', 'Production', {
        name: 'cvrProd',
        packageUri: 'https://cvr.blob.core.windows.net/deployments/CVRApi.Worker.cspkg',
        label: 'nodejsdeployment',
        configuration: '<?xml version="1.0" encoding="utf-8"?><ServiceConfiguration serviceName="CVRApi.Worker" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration" osFamily="3" osVersion="*" schemaVersion="2013-10.2.2">  <Role name="CVRProcessor">    <Instances count="1" />    <ConfigurationSettings>      <Setting name="Microsoft.WindowsAzure.Plugins.Diagnostics.ConnectionString" value="DefaultEndpointsProtocol=https;AccountName=cvr;AccountKey=r6apaUyCpRUtH6WysYN8zNB63MXE1VE1Hnm/Ut/oqPu8sQ+M/qeSyznIJnZP/2xDQA/eZD2SgayllYfAQz1vPQ==" />      <Setting name="DataConnectionString" value="DefaultEndpointsProtocol=https;AccountName=cvr;AccountKey=wXAWaJjOgqYEw1w3TQv3uJO0IDxuQmYB2vY8XzGTjoXXsozo1+LsDzr5EOsD2KolvIybc7U5pzTS+xc/96t6BQ==" />      <Setting name="SubscriptionId" value="3f09c367-93e0-4b61-bbe5-dcb5c686bf8a" />      <Setting name="Certificate" value="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" />    </ConfigurationSettings>  </Role></ServiceConfiguration>',//fs.readFileSync('ServiceConfiguration.Cloud.cscfg','utf-8'),
        startDeployment: true
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send(result);
        }
    });
};

//exports.list = function(req, res) {
//    createClient(function(client) {
//        client.listHostedServices(function(err, data) {
//            res.send(data.body);
//        });

//    });
//};