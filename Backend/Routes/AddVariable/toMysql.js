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

toMysqlRoute.get(`/getInfluxCredentials`, async(req, res)=>{
    try{
        const [credentials]=await pool.execute(`SELECT * FROM vmdata WHERE id=1`);
        res.json(credentials[0]);
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Internal Server Error ",e})
    }
})

// for variables
//POST 
toMysqlRoute.post('/', async (req, res) => {
    try{
        const { name, nodeId , expression , dataType , createdAt , serverName, frequency , nodeName} = req.body;
    const [result] = await pool.execute(
      'INSERT  INTO variables ( name , nodeId , expression , dataType , createdAt , serverName, frequency , nodeName) VALUES (?,?, ? , ? , ? , ?,?,?)',
      [name ?? null, nodeId ?? null, expression ?? null, dataType ?? null, createdAt?? null , serverName , frequency , nodeName]
    );
    res.json({ status:"success" });
}catch(e){
    console.error(e);
    res.status(500).json({status:"failed", message: "Internal Server Error" , error:e})
}
});
toMysqlRoute.put('/', async (req, res) => {
    try {
      const {
        currentName,  // the existing name in DB to find the row
        newName,      // the new name to update to
        nodeId,
        expression,
        frequency,
        nodeName,
      } = req.body;
  
      const [result] = await pool.execute(
        `UPDATE variables 
         SET name = ?, 
             nodeId = ?, 
             expression = ?, 
             frequency = ?, 
             nodeName = ?
         WHERE name = ?`,
        [
          newName,
          nodeId ?? null,
          expression ?? null,
          frequency ?? null,
          nodeName ?? null,
          currentName
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Variable not found" });
      }
  
      res.json({ message: "Variable updated successfully", updatedName: newName });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal Server Error", error: e });
    }
  });
//Update 

  
  

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



toMysqlRoute.get('/onlyVariable/:name', async (req, res) => {
    try {
        const [variables] = await pool.execute(`SELECT * FROM variables WHERE serverName = "${req.params.name}"`);
        res.json(variables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



//Get for data sending and Replication
toMysqlRoute.get('/variablesInfo' , async (req, res)=>{
    try{
        const [variableInfo] = await pool.execute(`SELECT variables.*, opcua.certificate , opcua.endurl,
             opcua.securityPolicy, opcua.securityMode, opcua.username, opcua.password FROM variables 
             INNER JOIN opcua ON variables.serverName = opcua.name;
`)
        res.json(variableInfo);
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Internal Server Error" , error:e})
    }
} )


// to give opcua servers

// POST 
toMysqlRoute.post('/opcuaData', async (req, res) => {
    try{
        const { name, endurl , securityMode , securityPolicy , username , password , certificate  } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO opcua (name, endurl , securityMode , securityPolicy , username , password , certificate ) VALUES (?, ? , ? , ? , ? , ? , ?)',
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
      console.log("Fetched servers:", servers); // 👈 check what's coming back
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

toMysqlRoute.delete('/deleteOpcua/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const [result] = await pool.execute(`DELETE FROM opcua WHERE name ='${name}'`);

        res.json({ message: 'Server  deleted', affectedRows: result.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


toMysqlRoute.put('/updateOpcua/:name', async (req, res) => {
    try {
        const { endurl , securityMode , securityPolicy , username , password , certificate } = req.body;
        const {name }= req.params
        
        const [result] = await pool.execute(
            `UPDATE opcua 
             SET endurl = ?, 
                 securityMode = ?, 
                 securityPolicy = ?, 
                 username = ?, 
                 password = ?, 
                 certificate = ? 
             WHERE name = ?`,
            [endurl, securityMode, securityPolicy, username, password, certificate ?? null, name]
          );
        res.json({ message: 'Server  updated', affectedRows: result.affectedRows });
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
      'INSERT  INTO tags ( name , nodeId , dataType , serverName ) VALUES (?, ? ,?, ?)',
      [name ?? null, nodeId ?? null, dataType ?? null , serverName]
    );
    console.log("sucessfull   " , name)
    res.json({ id: result.insertId, name , nodeId});
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error"})
}
})



toMysqlRoute.get('/unbinded/tags/:serverName', async (req, res) => {
    try {
        const { serverName } = req.params;
        const [tags] = await pool.execute(
            `SELECT t.*
             FROM tags t
             LEFT JOIN variables v
             ON t.nodeId = v.nodeId AND t.serverName = v.serverName
             WHERE v.nodeId IS NULL AND t.serverName = ?`,
            [serverName]
        );
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


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
        const [tag , fields] = await pool.execute('SELECT * FROM tags WHERE name = ?', [name]);
        res.json(tag[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

toMysqlRoute.get('/ServerTags/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const [tag] = await pool.execute('SELECT * FROM tags WHERE ServerName = ?', [name]);
        res.json(tag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ Update a tag's `nodeId`
toMysqlRoute.get('/:name', async (req, res) => {
    try {
        const [variable , fields] = await pool.execute(`SELECT * FROM variables WHERE name='${req.params.name}'`);
        res.json(variable[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Delete a variable by name
toMysqlRoute.delete('/:name', async (req, res) => {
    try {
        const { name } = req.params;

        // First, fetch the variable to check if formula is NULL
        const [rows] = await pool.execute(`SELECT formula FROM variables WHERE name = ?`, [name]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Variable not found" });
        }

        const { formula } = rows[0];

        if (formula !== null) {
            return res.status(400).json({ message: "Cannot delete variable linked to a formula. Set formula to NULL first." });
        }

        // Now safe to delete
        const [result] = await pool.execute(`DELETE FROM variables WHERE name = ?`, [name]);

        res.json({ message: 'Variable deleted', affectedRows: result.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

toMysqlRoute.delete(`/deleteTag/:id/:serverName`,async (req, res)=>{
    try{
        const {id , serverName}=req.params;
        const result=await pool.execute(`DELETE FROM tags WHERE nodeId = ? AND serverName=?`,[id , serverName]);
        if(result.affectedRows===0){
            return res.json({message:"Tag not found"})
        }
        res.json({message:"Tag deleted successfully"})
    }catch(e){
        res.json({message:"Failed to delete tag",e})
    }
})



toMysqlRoute.put(`/updateCloudInflux`,async(req, res)=>{
    try{
        const id =1;
        const { url , apiToken , orgId , bucketName  }=req.body;
        const result = await pool.execute(`UPDATE vmdata SET url =?, apiToken = ?, orgId = ? , bucketName = ? WHERE id =?`,
            [url , apiToken , orgId , bucketName , id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Variable not found" });
          }
      
          res.json({ message: "Credentials  Updated sucessfully" });
    }catch(e){
        res.status(500).json({message:"Failed to update ",e});
    }
})



toMysqlRoute.put('/setFormulaStatus/:name', async (req, res) => {
    try {
      const {
        formula
      } = req.body;
  
      const [result] = await pool.execute(
        `UPDATE variables 
         SET formula = ?
         WHERE name = ?`,
        [
            formula,
            req.params.name
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Variable not found" });
      }
  
      res.json({ message: "Variable status Updated sucessfully", updatedFormula: formula });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal Server Error", error: e });
    }
  });



module.exports = toMysqlRoute;