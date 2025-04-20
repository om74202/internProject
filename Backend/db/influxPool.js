






const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuration
const config = {
  url: process.env.INFLUX_URL || 'http://100.118.162.109:8086',
  token: process.env.INFLUX_TOKEN || 'LpMc9MLzp8h-sUErT0WtmP5eIx88-vkki_vz5PjyRE5efhKkJp7z3OmPZo9G5uadJ6odpMfWjIfSE_wKHdxarQ==',
  org: process.env.INFLUX_ORG || 'opsight',
  bucket: process.env.INFLUX_BUCKET || 'opcdata',
};

class InfluxPool {
  constructor() {
    if (!InfluxPool.instance) {
      console.log("Initializing InfluxDB connection...");

      this.client = new InfluxDB({ url: config.url, token: config.token });
      this.writeApi = this.client.getWriteApi(config.org, config.bucket, 'ms'); // ms precision
      this.queryApi = this.client.getQueryApi(config.org);

      // Optional: set default tags
      this.writeApi.useDefaultTags({ env: 'production' });

      InfluxPool.instance = this;
    }
    return InfluxPool.instance;
  }

  // writeData(measurement, fields, tags = {}) {
  //   const point = new Point(measurement);
    

  //   Object.entries(fields).forEach(([key, value]) => {
  //     if (value === null || value === undefined) {
  //       // Skip null/undefined values
  //       return;
  //     }

  //     if (typeof value === 'number') {
  //       // Always use float to avoid integer/float conflicts
  //       point.floatField(key, value);
  //     } else if (typeof value === 'boolean') {
  //       point.booleanField(key, value);
  //     } else if (typeof value === 'string') {
  //       point.stringField(key, value);
  //     } else {
  //       // Convert objects, arrays, Date, etc. to strings
  //       point.stringField(key, JSON.stringify(value));
  //     }
  //     console.log(key , value)
  //   });
    
    
  //   // Add tags
  //   Object.entries(tags).forEach(([key, value]) => {
  //     point.tag(key, String(value)); 
  //   });
    
  //   this.writeApi.writePoint(point);
  // }

  writeData(measurement, name, value, tags = {}) {
    const point = new Point(measurement);
  
    // Handle the value based on its type
    if (value === null || value === undefined) {
      console.warn(`Skipping null/undefined value for ${name}`);
      return; // Skip writing this point
    }
  
    // Add the field (using the 'name' parameter as field name)
    if (typeof value === 'number') {
      point.floatField(name, value);
    } else if (typeof value === 'boolean') {
      point.booleanField(name, value);
    } else if (typeof value === 'string') {
      point.stringField(name, value);
    } else {
      // For objects/arrays, convert to JSON string
      point.stringField(name, JSON.stringify(value));
    }
  
    console.log(`Writing ${name}:`, value , "in ", measurement);
  
    // Add tags
    Object.entries(tags).forEach(([key, tagValue]) => {
      point.tag(key, String(tagValue));
    });
  
    this.writeApi.writePoint(point);
  }

  async close() {
    try {
      await this.writeApi.close();
      console.log('InfluxDB connection closed gracefully');
    } catch (error) {
      console.error('Error closing InfluxDB connection:', error);
    }
  }
}

const influxPool = new InfluxPool();
influxPool.queryApi=influxPool.queryApi;
influxPool.bucket=config.bucket;

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await influxPool.close();
  process.exit();
});
process.on('SIGTERM', async () => {
  await influxPool.close();
  process.exit();
});

module.exports = influxPool;







const influxHost = 'http://localhost:8086';
const orgID = process.env.local_OrgID;
const token = process.env.TOKEN_LOCAL;
const remoteAPIToken = process.env.TOKEN_LIVE;
const remoteOrgID = process.env.remote_OrgID;
const remoteURL = process.env.HOST_LIVE;
const localBucketID = process.env.local_BucketID;
const remoteBucketName = process.env.DB_LIVE;

//Replication script to cloud
// async function setupReplication() {
//     try {
//         // Step 1: Create Remote
//         const remoteData = {
//             allowInsecureTLS: false,
//             description: 'Modbus Data Replication In TCM2 Press',
//             name: 'Example TCM2 Press name',
//             orgID: orgID,
//             remoteAPIToken: remoteAPIToken,
//             remoteOrgID: remoteOrgID,
//             remoteURL: remoteURL,
//         };

//         console.log('Creating remote...');
//         const remoteResponse = await axios.post(`${influxHost}/api/v2/remotes`, remoteData, {
//             headers: {
//                 Authorization: `Token ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         const remoteID = remoteResponse.data.id;
//         console.log('Remote created successfully with ID:', remoteID);

//         // Step 2: Create Replication
//         const replicationData = {
//             name: 'Example replication stream  TCM2 Press',
//             orgID: orgID,
//             remoteBucketName: remoteBucketName,
//             localBucketID: localBucketID,
//             remoteID: remoteID,
//         };

//         console.log('Creating replication...');
//         const replicationResponse = await axios.post(`${influxHost}/api/v2/replications`, replicationData, {
//             headers: {
//                 Authorization: `Token ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log('Replication created successfully:', replicationResponse.data);
//     } catch (error) {
//         console.error('Error setting up replication:', error.response ? error.response.data : error.message);
//     }
// }
