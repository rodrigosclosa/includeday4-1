var Agenda = function () {

    //Dispenser ids porque os valores estão fixos no código como BH e Campinas
    //var dispenserList = [{'value':1,'name':'BH'},{'value':2,'name':'Campinas'}];

    ///*
    // Esta função é usada limpar a tela, voltando os controles para os valores padrão
    ///*
    var limparFormulario = function () {
            $('#dispenser').val(''),
            $('#medicamento').val(''),
            $('#inicio').val('')
            $('#intervalo').val('');
    };

    ///*
    // Esta função é usada para salvar a agenda no banco de dados do serviço
    ///*
    var cadastrarItem = function (latlong) {

        /// criação do objeto que deve ser persistido no serviço
        /// esta estrutura de dados JSON recebe os valores dos controles na tela
        var item = {
            idDispenser: $('#dispenser').val(),
            numeroMedicamento: $('#medicamento').val(),
            dataInicio: new Date($('#inicio').val()).toJSON(),
            intervaloMinutos: $('#intervalo').val()
        };

        if (item === null) {
            return;
        };

        $.ajax({
            async: true,
            type: "POST",
            data: JSON.stringify(item),
            url: API_URL + '/agenda/v1/new',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                limparFormulario();
                carregarLista();
                bootbox.alert('Cadastrado com sucesso!');
            },
            error: function (xhr) {
                bootbox.alert(xhr.responseJSON.error.message);
            }
        });

    }

    ///*
    // Esta função é usada para carregar os valores da agenda nos controles da tela
    // Ele deve requisitar um incidente usando o valor do id que está no atributo 'id-objeto'
    ///*
    var editarItem = function () {

        // neste caso $this é o link que foi clicado
        var $this = $(this);
        
        // recupera o valor do id-objeto
        var $id = $this.attr('id-objeto');

        $.ajax({
            async: true,
            type: "GET",
            url: API_URL + '/agenda/v1/get/' + $id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                
                // quando o serviço recupera com sucesso um objeto agenda
                // o valor da variável 'data' virá com os dados do objeto
                // em seguida usamos os valores para aprentar nos controles da tela                
                $('#dispenser').val(data.idDispenser);
                $('#medicamento').val(data.numeroMedicamento);
                $('#inicio').val(data.dataInicio);
                $('#intervalo').val(data.intervaloMinutos);
            },
            error: function (xhr) {
                bootbox.alert(xhr.responseJSON.error.message);
            }
        });
    };
    


    ///*
    // Esta função é usada para remover o incidente no banco de dados do serviço
    // Ela precisa do 'id-objeto' que está no atributo do link
    ///*
    var removerItem = function () {
        
        var $this = $(this);
        var $id = $this.attr('id-objeto');

        // esta função cria um popup de confirmação para o usuário
        // permitindo que ele desista ou confirme a ação de remoção
        bootbox.confirm("Tem certeza que deseja remover?", function (result) {

            // Ao responder (sim ou não) no popup, o resultado é enviado para a variável 'result'
            // result = true se o usuário disse que SIM, confirma a ação
            // result = false se o usuário desistiu e disse que NÃO confirma a ação
            if (result) {
                $.ajax({
                    async: true,
                    type: "DELETE",
                    url: API_URL + '/agenda/v1/delete/' + $id,
                    dataType: "JSON",
                    processData: true,
                    success: function (data) {
                        carregarLista();
                        bootbox.alert('Removido com sucesso!');
                    },
                    error: function (xhr) {
                        bootbox.alert(xhr.responseJSON.error.message);
                    }
                });
            }
        });

    };
    
    ///*
    // Esta função é usada habilitar os eventos de click na tela
    // ela deve ser executada, assim que a tela estiver pronta para ser utilizada (geralmente no contrutor)      
    ///*
    var adicionarEventos = function () {

        $('.table-result .btn-default').each(function () {
            var $this = $(this);
            $this.click(editarItem);
        });

        $('.table-result .btn-danger').each(function () {
            var $this = $(this);
            $this.click(removerItem);
        });

    };
        
    ///*
    // Esta função é usada para carregar os medicamentos na lista da página (tabela)    
    ///*
    var carregarLista = function () {

        $.ajax({
            async: true,
            type: "GET",
            url: API_URL + '/agenda/v1/get/',
            dataType: "JSON",
            processData: true,
            success: function (data) {

                Utils.limparLista();

                if (data != null && data.items.length > 0) {

                    $.each(data.items, function (i, item) {
                        
                        var tr = $('<tr/>');

                        tr.append("<td>" + Utils.obterNomeDispenser(item.idDispenser) + "</td>");
                        tr.append("<td>" + Utils.obterNomeMedicamento(item.numeroMedicamento) + "</td>");
                        tr.append("<td>" + item.dataInicio + "</td>");                        
                        tr.append("<td>" + Utils.converterTrueFalseEmTexto(item.dosagemRetirada) + "</td>");
                        tr.append("<td>" + item.intervaloMinutos + "</td>");
                        
                        var template = "<td>";
                        template += "<div class='btn-group btn-group-xs btn-group-show-label'>";
                        template += "<button type='button' name='botao-remover' id='botao-remover' id-objeto='" + item.id + "' class='btn btn-danger'><span class='glyphicon glyphicon glyphicon-remove' aria-hidden='true'>Remover</span></button>";
                        template += "</div>";
                        template += "</td>";

                        tr.append(template);

                        $('.table-result').append(tr);
                    });
                    
                    // a função de adicionar eventos precisa ser chamada após a lista ser preenchida
                    // pois os links que foram criados precisam agora receber o comportamento de click
                    adicionarEventos();

                }

            },
            error: function (xhr) {
                alert("Ocorreu um erro ao carregar a lista.");
            }
        });

    };

    return {
        //Função principal que inicializa o módulo
        inicializar: function () {
            carregarLista();
            $('#btn-cadastrar').click(cadastrarItem);
            $('.datepicker').datepicker({
                format: 'mm/dd/yyyy',
                startDate: '-3d'
            });
        }
    };
} ();