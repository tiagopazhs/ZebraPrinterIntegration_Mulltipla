const produtosImpressos = [];
const _produtosImpressos = [];
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

    async function sendToPrinterProdutosLista(produtos) {
        return new Promise((resolve, reject) => {
            let nome;
            fs.readFile("/Users/fo016145/documents/Etiquetas/EtiquetaProdutos.txt", 'utf-8', (err, data) => {
                for (let i = 0; i < produtos.length; i++) { 
    
                    if(i== 0)
                    {
                        nome = produtos[i].Codigo.toString();
                        console.log(produtos[i].Codigo + " - " + produtos[i].Descricao);
                        
                        data = data.replace('@produto_ean1', produtos[i].CodigoBarras);
                            console.log(produtos[i].Descricao.slice(0,17)) ;
                            console.log(produtos[i].Descricao.slice(17,34));

                        data = data.replace('@produto_descricao01_01', produtos[i].Descricao.slice(0,17));
                        data = data.replace('@produto_descricao01_02', produtos[i].Descricao.slice(17,34));
                    }
                    if(i== 1)
                    {
                        nome = nome+produtos[i].Codigo.toString();
                        console.log(produtos[i].Descricao.slice(0,17));
                        console.log(produtos[i].Descricao.slice(17,34));
                        data = data.replace('@produto_ean2', produtos[i].CodigoBarras);
    
                        data = data.replace('@produto_descricao02_01', produtos[i].Descricao.slice(0,17));
                        data = data.replace('@produto_descricao02_02', produtos[i].Descricao.slice(17,34));
                    }
                    if(i== 2)
                    {console.log(produtos[i].Descricao.slice(0,17));

                        console.log(produtos[i].Descricao.slice(17,34));

                        nome = nome+produtos[i].Codigo;
                        console.log(produtos[i].Codigo + " - " + produtos[i].Descricao);
                        
                        data = data.replace('@produto_ean3', produtos[i].CodigoBarras);
    
                        data = data.replace('@produto_descricao03_01', produtos[i].Descricao.slice(0,17));
                        data = data.replace('@produto_descricao03_02', produtos[i].Descricao.slice(17,34));
                    }
                };
                fs.writeFile("/Users/fo016145/documents/Etiquetas/Impressao/Produtos/"+nome+".zpl", data, (err) => {
                    exec("lpr -l /Users/fo016145/documents/Etiquetas/Impressao/Produtos/"+nome+".zpl", (err, stdout, stderr) => {
                       setTimeout(() => resolve(null), 1000);
                  });
                });
                resolve(null);
            });
        });
    };
    module.exports = {
        async buscarProdutos() {
            // console.log('cheguei')
            await axios.get(CONSTANTS.apiUrl + '/etiquetaproduto').then(async res => {
                // console.log('res.data', res.data)

                let produtos = res.data.filter(element => !produtosImpressos.includes(element.Id));
                // console.log('produtos', produtos)
               var _produto;

                if (produtos.length >2) { 
                    await sendToPrinterProdutosLista(produtos.slice(0,3));
    
                    produtos.slice(0,3).forEach(async element => {
                        console.log("Imprimindo produto de código " + element.Codigo.split('.0').join('') + "...");
    
                        produtos.slice(0,3).push(element.Id);
    
                        await axios.put(CONSTANTS.apiUrl + '/etiquetaproduto/' + element.Id, {});
                    });  
                            
                } else if (produtos.length == 0) {
                    console.log("Nenhum Etiqueta de Produto a imprimir...");
                }
            })
        },
    }