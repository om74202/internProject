const pool = require("../../db/db");
const express=require('express');

const toMysqlFormulaRoute= express.Router()


toMysqlFormulaRoute.post('/', async (req, res) => {
    try{
        const { name, expression , dataType , createdAt , serverName, frequency } = req.body;
    const [result] = await pool.execute(
      'INSERT  INTO formula ( name  , expression , dataType , createdAt , serverName, frequency ) VALUES (? , ? , ? , ?,?,?)',
      [name , expression , dataType ?? null, createdAt , serverName , frequency ]
    );
    res.json({ id: name });
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" , error:e})
}
});

toMysqlFormulaRoute.get('/onlyFormula/:serverName', async (req, res) => {
    try{
    const [result , field] = await pool.execute(
      `SELECT * FROM formula WHERE serverName="${req.params.serverName}"`
    );
    console.log(result)
    res.json(result);
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" , error:e})
}
});

toMysqlFormulaRoute.get('/:name', async (req, res) => {
    try{
    const [result] = await pool.execute(
      `SELECT * FROM formula WHERE name="${req.params.name}"`
    );
    res.json(result[0]);
}catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" , error:e})
}
});

toMysqlFormulaRoute.delete('/deleteFormula/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const [result] = await pool.execute(`DELETE FROM formula WHERE name ='${name}'`);

        res.json({ message: 'formula  deleted', affectedRows: result.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


toMysqlFormulaRoute.put('/update/:name', async (req, res) => {
    try {
      const { newName, expression, dataType,  frequency } = req.body;
      const oldName = req.params.name;
  
      const [result] = await pool.execute(
        'UPDATE formula SET name = ?, expression = ?, dataType = ?, frequency = ? WHERE name = ?',
        [newName, expression, dataType ?? null, frequency, oldName]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Formula not found to update' });
      }
  
      res.json({ message: 'Formula updated successfully', updated: result.affectedRows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal Server Error", error: e });
    }
  });
    

module.exports=toMysqlFormulaRoute