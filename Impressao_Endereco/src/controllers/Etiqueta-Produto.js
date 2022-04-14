const produtosImpressos = [];
const axios = require('axios');
const CONSTANTS = require("../../constants.js");
var fs = require('fs');
var {
    exec
} = require("child_process");
 

async function sendToPrinterProdutos(produtos) {
    return new Promise((resolve, reject) => {
        fs.readFile("/Users/fo016145/documents/Etiquetas/ModeloEtiquetaProduto.txt", 'utf-8', (err, data) => {
 
          
            data = data.replace('@endereco_ean', produtos.Codigo);
 
            var desc1 = "";
            var desc2 = "";
            if (produtos.Descricao.length > 50) {
                desc1 = produtos.Descricao.slice(0, 50);
                desc2 = produtos.Descricao.slice(50);
            } else {
                desc1 = produtos.Descricao;
                desc2 = null;
            }
            data = data.replace('@produto_string', desc1);
            data = data.replace('@produto_string2', desc2);
 
           

            fs.writeFile("/Users/fo016145/documents/Etiquetas/Impressao/Produtos/"+produtos.Codigo+".zpl", data, (err) => {
                exec("lpr -l /Users/fo016145/documents/Etiquetas/Impressao/Produtos/"+produtos.Codigo+".zpl", (err, stdout, stderr) => {
                   setTimeout(() => resolve(null), 1000);
              });
            });
 
            resolve(null);
        });
    })};

module.exports = {
    async buscarProdutos() {
        // console.log('cheguei')
        await axios.get(CONSTANTS.apiUrl + '/etiquetaproduto').then(async res => {
            // console.log('res.data', res.data)
 
            let produtos = res.data.filter(element => !produtosImpressos.includes(element.Id));
            // console.log('produtos', produtos)
 
            if (produtos.length >0) {
                for (let i = 0; i < produtos.length; i++) {      
                await sendToPrinterProdutos(produtos[i]);
 
                produtos.forEach(async element => {
                    console.log("Imprimindo produto de código " + element.Codigo.split('.0').join('') + "...");
 
                    produtosImpressos.push(element.Id);
 
                    await axios.put(CONSTANTS.apiUrl + '/etiquetaproduto/' + element.Id, {});
                });
              };
               
            } else if (produtos.length == 0) {
                console.log("Nenhum Etiqueta de Produto a imprimir...");
            }
       
 
        })
    },
}