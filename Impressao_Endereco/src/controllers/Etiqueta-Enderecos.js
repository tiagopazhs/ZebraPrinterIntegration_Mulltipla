const enderecosImpressos = [];
const axios = require('axios');
const CONSTANTS = require("../../constants.js");
var fs = require('fs');
var {
    exec
} = require("child_process");




// async function sendToPrinterEnderecos(endereco, descricao) {
//     return nconst enderecosImpressos = [];
//const axios = require('axios');
//const CONSTANTS = require("../../constants.js");
var fs = require('fs');
var {
    exec
} = require("child_process");




/*async function sendToPrinterEnderecos(endereco, descricao) {
    return new Promise((resolve, reject) => {

        exec('lpr -l /Users/fo016145/documents/label_03.zpl', (err, stdout, stderr) => {
            setTimeout(() => resolve(null), 1000);
        });
    });
};*/


 async function sendToPrinterEnderecos(endereco, descricao) {
     return new Promise((resolve, reject) => {
         fs.readFile("/Users/fo016145/documents/Etiquetas/ModeloEtiquetaEndereco.txt", 'utf-8', (err, data) => {
             data = data.replace('@endereco_ean', endereco);
             data = data.replace('@endereco_string', descricao);
             console.log(data);

            //   fs.writeFile("/Users/fo016145/documents/Etiquetas/label_03.zpl", data, (err) => {
            //      exec("lpr -l /Users/fo016145/documents/Etiquetas/label_03.zpl", (err, stdout, stderr) => {
            //         setTimeout(() => resolve(null), 1000);
            //       });
            //   });

                          fs.writeFile("/Users/fo016145/documents/Etiquetas/Impressao/"+endereco+".zpl", data, (err) => {
                 exec("lpr -l /Users/fo016145/documents/Etiquetas/Impressao/"+endereco+".zpl", (err, stdout, stderr) => {
                    setTimeout(() => resolve(null), 1000);
                  });
              });

           // fs.unlink("/Users/fo016145/documents/Etiquetas/Impressao/"+endereco+".zpl",errors)

             resolve(null);

             

         });

     });
 };






module.exports = {

    async buscarEnderecos() {
        await axios.get(CONSTANTS.apiUrl + '/etiquetaendereco').then(async res => {
            let enderecos = res.data.filter(element => !enderecosImpressos.includes(element.Id));

            if (enderecos.length > 0) {
                //  console.log(enderecos.length);
                //  console.log(enderecos);
                for (let i = 0; i < enderecos.length; i++) {
                    //console.log(i);
                    if (!enderecosImpressos.includes(enderecos[i].Id)) {
                        console.log("Imprimindo endereço de código " + enderecos[i].Codigo + "...");

                        await sendToPrinterEnderecos(enderecos[i].Codigo, enderecos[i].Descricao);

                        enderecosImpressos.push(enderecos[i].Id);
                        await axios.put(CONSTANTS.apiUrl + '/etiquetaendereco/' + enderecos[i].Codigo, {});

                    }

                }

            } else {
                console.log("Nenhuma Etiqueta de Endereço a imprimir...");
            }
        });
    }
}