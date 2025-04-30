const express=require('express')
const axios = require('axios');
const pool  = require('../../db/db');




  

const influxHost = 'http://100.118.162.109:8086';
const orgID = '44a6132d1ef62ddc';
const token = 'LpMc9MLzp8h-sUErT0WtmP5eIx88-vkki_vz5PjyRE5efhKkJp7z3OmPZo9G5uadJ6odpMfWjIfSE_wKHdxarQ==';
const tokenf='nmGDpQblBVIwidHijv78LPksyh8f6b_qaGTqzCiH_-Pi63lYJOaKh5SQGvNTyWRife6Q8CDGYCx8oxul0hi0NA=='
let remoteAPIToken ='yKbpyW8gYlaHPn7cZBd-k3KhRrMLSPFFj1jiwsvv5tQgXWPNSMeXztL_L1H0y38_fan2YDYgUPRJ4LHZ7P-lmw==';
let remoteOrgID = 'e0210721902225b0';
let remoteURL = 'http://40.81.226.154:8086';
const localBucketID = 'be03b6124466c163';
let remoteBucketName = 'Gateway_Test';

// async function fetchData() {
//     const [credentials]=await pool.execute(`SELECT * FROM vmdata WHERE id=1`);
//         console.log(credentials[0])
//         const data=credentials[0]
//         remoteAPIToken=data.apiToken
//         remoteOrgID=data.orgId
//         remoteURL=data.url
//         remoteBucketName=data.bucketName    
//   }
  
//   fetchData();

const ReplicationRouter=express.Router();


ReplicationRouter.post('/replication', async (req, res) => {
  try {
    await setupReplication(); // Call your function
    res.status(200).json({ message: 'Replication setup successfully' });
  } catch (error) {
    console.error('Replication setup error:', error.message);
    res.status(500).json({ error: 'Failed to setup replication' });
  }
});

// Function to Create Remote and Setup Replication
async function setupReplication() {
    try {
      const remoteName = `${Date.now()}|LocalBucket:${localBucketID} | RemoteBucket:${remoteBucketName} | LocalURL:${influxHost} | RemoteURL:${remoteURL} |-${orgID} | ${remoteOrgID}`;
  
      let remoteID;
      
        // Step 1: Create Remote
        const remoteData = {
          allowInsecureTLS: false,
          description: 'Data Replicate In TCM2 Press',
          name: remoteName,
          orgID: orgID,
          remoteAPIToken: remoteAPIToken,
          remoteOrgID: remoteOrgID,
          remoteURL: remoteURL,
        };
  
        const remoteResponse = await axios.post(`${influxHost}/api/v2/remotes`, remoteData, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        remoteID = remoteResponse.data.id;
        console.log('Remote created with ID:', remoteID);
      
  
      // Step 2: Create Replication
      const replicationData = {
        name: `Replicate stream TCM2 Press1-${Date.now()}`,
        orgID: orgID,
        remoteBucketName: remoteBucketName,
        localBucketID: localBucketID,
        remoteID: remoteID,
      };
      console.log(replicationData)
  
      const replicationResponse = await axios.post(`${influxHost}/api/v2/replications`, replicationData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Replication created successfully:', replicationResponse.data);
    } catch (error) {
      console.error('Error setting up replication:',  error.response ? error.response.data : error.message);
    }
  }
  
  

// async function main() {
//     await connectToModbus();
//     fetchAndQueueDataMS();
//     setupReplication()
// }

module.exports=ReplicationRouter
