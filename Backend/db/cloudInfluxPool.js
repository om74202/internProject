




const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuration
const config = {
  url: process.env.INFLUX_URL || 'https://us-east-1-1.aws.cloud2.influxdata.com',
  token: process.env.INFLUX_TOKEN || 'LGTg0lHw7gXxi2GjrqFlvTa07lUvK2Ukkbr6NfCqAkQK-YbkRd0szNelQgG8YOKA-ekFY6pjLYRAUpSGDMzdZA==',
  //LGTg0lHw7gXxi2GjrqFlvTa07lUvK2Ukkbr6NfCqAkQK-YbkRd0szNelQgG8YOKA-ekFY6pjLYRAUpSGDMzdZA==
  org: process.env.INFLUX_ORG || 'testerGATEWAY',
  bucket: process.env.INFLUX_BUCKET || 'GatewayBucket',
};

class CloudInfluxPoolc {
  constructor() {
    if (!CloudInfluxPoolc.instance) {
      console.log("Initializing InfluxDB connection...");

      this.client = new InfluxDB({ url: config.url, token: config.token });
      this.writeApi = this.client.getWriteApi(config.org, config.bucket, 'ms'); // ms precision
      this.queryApi = this.client.getQueryApi(config.org);

      // Optional: set default tags
      this.writeApi.useDefaultTags({ env: 'production' });

      CloudInfluxPoolc.instance = this;
    }
    return CloudInfluxPoolc.instance;
  }

  writeData(measurement, fields, tags = {}) {
    const point = new Point(measurement);
    

    Object.entries(fields).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        // Skip null/undefined values
        return;
      }

      if (typeof value === 'number') {
        // Always use float to avoid integer/float conflicts
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else if (typeof value === 'string') {
        point.stringField(key, value);
      } else {
        // Convert objects, arrays, Date, etc. to strings
        point.stringField(key, JSON.stringify(value));
      }
    });
    
    
    // Add tags
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, String(value));
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

const CloudInfluxPool = new CloudInfluxPoolc();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await influxPool.close();
  process.exit();
});
process.on('SIGTERM', async () => {
  await influxPool.close();
  process.exit();
});

module.exports = CloudInfluxPool;
