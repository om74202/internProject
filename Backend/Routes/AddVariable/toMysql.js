const pool = require("../../db/db");
const express=require('express');

const toMysqlRoute= express.Router()


async function testPoolConnection() {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Successfully connected to MySQL!");
      connection.release(); // Release the connection back to the pool
      return true;
    } catch (err) {
      console.error("❌ Failed to connect to MySQL:", err);
      return false;
    }
  }
  
  // Run the test
testPoolConnection();

// for variables
//POST 
toMysqlRoute.post('/', async (req, res) => {
    try{
        const { name, nodeId , expression , dataType , createdAt , serverName } = req.body;
    const [result] = await pool.execute(
      'INSERT  INTO variables ( name , nodeId , expression , dataType , createdAt , serverName ) VALUES (?,?, ? , ? , ? , ?)',
      [name ?? null, nodeId ?? null, expression ?? null, dataType ?? null, createdAt?? null , serverName]
    );
    res.json({ id: result.insertId, name , nodeId });
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" , error:e})
}
});

// GET
toMysqlRoute.get('/', async (req, res) => {
    try {
        const [variables] = await pool.execute('SELECT * FROM variables');
        res.json(variables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// to give opcua servers

// POST 
toMysqlRoute.post('/opcuaData', async (req, res) => {
    try{
        const { name, endurl , securityMode , securityPolicy , username , password , certificate  } = req.body;
    const [result] = await pool.execute(
      'INSERT  INTO opcua (name, endurl , securityMode , securityPolicy , username , password , certificate ) VALUES (?, ? , ? , ? , ? , ? , ?)',
      [name , endurl , securityMode , securityPolicy , username , password , certificate]
    );
    res.json({ message:`${name} server created successfully`});
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" , error:e})
}
});
// GET
toMysqlRoute.get('/opcuaData', async (req, res) => {
    try {
        const [servers] = await pool.execute('SELECT * FROM opcua');
        res.json(servers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

toMysqlRoute.get('/opcuaData/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const [endpoint , fields] = await pool.execute(`SELECT * FROM opcua WHERE name ="${name}"`);
        console.log(endpoint[0] , name);
        res.json(endpoint[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// for tags 


toMysqlRoute.post('/tags' , async (req, res)=>{
    try{
        const { name, nodeId , dataType ,serverName } = req.body;
    const [result] = await pool.execute(
      'INSERT IGNORE INTO tags ( name , nodeId , dataType , serverName ) VALUES (?, ? ,?, ?)',
      [name ?? null, nodeId ?? null, dataType ?? null , serverName]
    );
    console.log("sucessfull   " , name)
    res.json({ id: result.insertId, name , nodeId});
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error"})
}
})





toMysqlRoute.get('/tags', async (req, res) => {
    try {
        const [tags] = await pool.execute('SELECT * FROM tags');
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



toMysqlRoute.get('/tags/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const tag = await pool.execute('SELECT * FROM tags WHERE name = ?', [name]);
        res.json(tag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ Update a tag's `nodeId`
toMysqlRoute.put('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { nodeId } = req.body;

        const [result] = await pool.execute(
            'UPDATE tags SET nodeId = ? WHERE name = ?', 
            [nodeId, name]
        );

        res.json({ message: 'Variable updated', affectedRows: result.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Delete a variable by name
toMysqlRoute.delete('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const [result] = await pool.execute(`DELETE FROM variables WHERE name ='${name}'`);

        res.json({ message: 'Variable deleted', affectedRows: result.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = toMysqlRoute;