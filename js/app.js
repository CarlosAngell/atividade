const URL_API = "http://app.professordaniloalves.com.br";

/* MENU */
$('.scrollSuave').click(() => {
    $('html, body').animate(
        { scrollTop: $(event.target.getAttribute('href')).offset().top - 100 }, 500);
});


/* ENVIAR CADASTRO */
const formularioCadastro = document.getElementById("formCadastro");
formularioCadastro.addEventListener("submit", enviarFormularioCadastro, true);

function enviarFormularioCadastro(event) {
  event.preventDefault();
  
  $("#formCadastro .invalid-feedback").remove();
  $("#formCadastro .is-invalid").removeClass("is-invalid");

  fetch(URL_API + "/api/v1/cadastro", {
      method: "POST",
      headers: new Headers({
          Accept: "application/json",
          'Content-Type': "application/json",
      }),
      body: JSON.stringify({
        nomeCompleto: document.getElementById("cadastroNomeCompleto").value,
        dataNascimento: document.getElementById("cadastroDataNascimento").value,
        sexo: document.querySelector("input[name=cadastroSexo]:checked").value,
        cep: document.getElementById("cadastroCep").value.replace('-', ''),
        cpf: document.getElementById("cadastroCpf").value.replace(/[.-]/g, ''),
        uf: document.getElementById("cadastroUf").value,
        cidade: document.getElementById("cadastroCidade").value,
        logradouro: document.getElementById("cadastroLogradouro").value,
        numeroLogradouro: document.getElementById("cadastroNumeroLogradouro").value,
        email: document.getElementById("cadastroEmail").value
      })
  })
      .then(response => {
          return new Promise((myResolve, myReject) => {
            response.json().then(json => {
              console.log(response.status);
                  myResolve({ "status": response.status, json });
            });


            alert('Enviado!');
            $('#formCadastro input').val("");
            $('#btnSubmitCadastro').val("");
            $('#cadastroDeAcordo').prop("checked", false);
            $('#btnSubmitCadastro').prop('disabled', true);
          });
      }).then(response => {
          if (response && response.json.errors) {
            Object.entries(response.json.errors).forEach((obj, index) => {
                const filde = obj[0];
                const id = 'cadastro' + filde.charAt(0).toUpperCase() + filde.slice(1);
                const texto = obj[1][0];
                criarDivImcDeCampoInvalido(id, texto, index == 0);
              })
          }
      }).catch(err => {
          console.log(err);
      });
}

$('#cadastroDeAcordo').click(function () {
  var isChecked = $(this).is(':checked');
    $('#btnSubmitCadastro').prop('disabled', !isChecked);
});

/* FIM ENVIAR CADASTRO */

/* CRIAR LISTA DE ESTADOS */

popularListaEstados();

function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
        headers: new Headers({
            Accept: "application/json"
        })
    })
    .then(response => {
        return response.json();
    }).then(estados => {
        const elSelecetUF = document.getElementById("cadastroUf");
        estados.forEach((estado) => {
            elSelecetUF.appendChild(criarOption(estado.uf, estado.nome));
        })
    }).catch(err => {
        alert("Erro ao salvar cadastro");
        console.log(err);
    })

}

function criarOption(valor, texto) {
    const node = document.createElement("option");
    const textnode = document.createTextNode(texto)
    node.appendChild(textnode);
    node.value = valor;
    return node;
}

/* FIM CRIAR LISTA DE ESTADOS */


/* PREENCHER ENDEREÇO */
function popularEnderecoCadastro() {
  
  let cep = document.getElementById("cadastroCep").value;
  ce = cep.replace('-', '');

  fetch(URL_API + "/api/v1/endereco/" + cep, {
    method: "get",
  })
    .then(response => {
      return response.json();
    }).then(cepObj => {
      console.log(cepObj);
      document.getElementById("cadastroLogradouro").value = cepObj.logradouro;
      document.getElementById('cadastroUf').value = cepObj.uf;

  }).catch(err => {
      alert("Erro ao pegar o CEP");
      console.log(err);
  })
}
/* FIM PREENCHER ENDEREÇO */

/* IMC */

$('#btnCalcularIMC').click(() => {
    $("#resultadoIMC").html("");
    $("#formImc .invalid-feedback").remove();
    $("#formImc .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/imc/calcular", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
            peso: document.getElementById("pesoImc").value,
            altura: document.getElementById("alturaImc").value,
        })
    })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({ "status": response.status, json });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = parseIdImc(obj[0]);
                    const texto = obj[1][0];
                    criarDivImcDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#resultadoIMC").html(response.json.message);
                $('#modalResultadoIMC').modal('show');
            }
        }).catch(err => {
            $("#resultadoIMC").html("Ocorreu um erro ao tentar calcular seu IMC.");
            $('#modalResultadoIMC').modal('show');
            console.log(err);
        });

});

function parseIdImc(id) {
    return id + "Imc";
}

function criarDivImcDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}

/* FIM IMC */