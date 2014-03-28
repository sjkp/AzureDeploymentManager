# AzureDeploymentManager

AzureDeployment manager is a set of tools, built on top of the Microsoft Azure Management API that makes it easy to provision and deprovision Cloud Services. 

The purpose of the project was to build a simple REST service that can be called from Azure Scheduling service that will deploy a cloud service.

# To get Started 
- run npm install to get all the packages
- create an ".env" file (for environment variables) in the root of application, and added the following two lines
AZURE_STORAGE_ACCOUNT=[NAME_OF_STORAGEACCOUNT]
AZURE_STORAGE_ACCESS_KEY=[STORAGE_ACCOUNT_KEY]
- get your subscription certificate by running "azure account cert export" from a command line with the node azure-cli tools installed. If you havn't downloaded and setup your subscription you have to do the following first
- npm install azure-cli -g
- azure account download (download the subscription file)
- azure account import [path_to_subscription]

In your storage account, in the blob storage you have to create a container "deployments" in this folder you must upload the *.cscfg and *.cspkg file of your cloud service. 
Also be sure to change the code in route\cloudservice.js to reflect the name of your cloudservice and subscription file.

# REST endpoints

List deployment if anything deployed
https://[server]/cloudservice/[CloudServiceName]/

Delete deployment
https://[server]/cloudservice/[CloudServiceName]/delete

Start deployment
https://[server]/cloudservice/[CloudServiceName]/deploy



# Contact 
Write me: mail@sjkp.dk