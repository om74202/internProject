






const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuration
const config = {
  url: process.env.INFLUX_URL || 'http://192.168.1.35:8086',
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

  writeData(measurement, fields, tags = {}) {
    const point = new Point(measurement);
    

    Object.entries(fields).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        // Skip null/undefined values
        return;
      }

      if (typeof value === 'number') {
        console.log("number")
        // Always use float to avoid integer/float conflicts
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        console.log("boolean")
        point.booleanField(key, value);
      } else if (typeof value === 'string') {
        console.log("string")
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

const influxPool = new InfluxPool();

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
