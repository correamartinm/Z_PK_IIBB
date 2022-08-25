sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("zpkiibb.zpkiibb.controller.View1", {
      onInit: function () {
        this._wizard = this.byId("CreateProductWizard");
        this._oNavContainer = this.byId("wizardNavContainer");
        this._oWizardContentPage = this.byId("wizardContentPage");
      },

      //Se selecciona el Archivo del padron del servidor ..............

      onSelectPadron: function () {
        this.getView().byId("SelectArchivo").setEnabled(true);
      },

      selectArchivoServer: function () {
        this.getView().byId("id-file-upload").setVisible(false);
      },

      selectArchivoLocal: function () {
        this.getView().byId("id-file-upload").setVisible(true);
      },

      onEjecutar: function () {},

      onUploadFileChange: function (e) {
        var oResourceBundle = this.getView()
          .getModel("i18n")
          .getResourceBundle();
        var fU = this.getView().byId("id-carga-fichero");
        var file = e.getParameter("files");
        var reader = new FileReader();
        var params = "EmployeesJson=";
        reader.onload = function (oEvent) {
          var strCSV = oEvent.target.result;
          var arrCSV = strCSV.match(/[\w .]+(?=,?)/g);
          var noOfCols = 6;
          var headerRow = arrCSV.splice(0, noOfCols);
          var data = [];
          while (arrCSV.length > 0) {
            var obj = {};
            var row = arrCSV.splice(0, noOfCols);
            for (var i = 0; i < row.length; i++) {
              obj[headerRow[i]] = row[i].trim();
            }
            data.push(obj);
          }
          var Len = data.length;
          data.reverse();
          params += "[";
          for (var j = 0; j < Len; j++) {
            params += JSON.stringify(data.pop()) + ", ";
          }
          params = params.substring(0, params.length - 2);
          params += "]";
          // MessageBox.show(params);

          var http = new XMLHttpRequest();
          var url = oResourceBundle.getText("UploadEmployeesFile").toString();
          http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
              var json = JSON.parse(http.responseText);
              var status = json.status.toString();
              switch (status) {
                case "Success":
                  MessageToast.show("Data is uploaded succesfully.");
                  break;
                default:
                  MessageToast.show("Data was not uploaded.");
              }
            }
          };
          http.open("POST", url, true);
          http.setRequestHeader(
            "Content-type",
            "application/x-www-form-urlencoded"
          );
          http.send(params);
        };
        reader.readAsBinaryString(file);
      },

      onUploadCompleto: function (e) {
                 this.getView().byId("id-btn-upload").setVisible(true);
                var MsgUpload = this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("msgcarga");
                MessageToast.show(MsgUpload);
      },

      parametrosActivacion: function () {},

      tablaActivacion: function () {
        this.model.setProperty("/navApiEnabled", true);
      },

      tablaCompleta: function () {
        this.model.setProperty("/navApiEnabled", false);
      },

      onBeforeUploadStarts: function(oEvent) {
        var fileName = oEvent.getParameter("fileName");
        // Header Slug
        var oCustomerHeaderSlug = new UploadCollectionParameter({
          name: "slug",
          value: gOrder + ";" + gNumIntervencion + ";" + fileName
        });
        var oUploadCollection = oEvent.getSource();
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      },

      onFileupload: function () {
        var oSociedad = this.getView().byId("id-sociedad-p1"),
          oRetencion = this.getView().byId("id-select-retenciones"),
          oIdRetencion = this.getView().byId("id-select-idretencion"),
          oPnlPadron = this.getView().byId("panel-padron"),
          oPnlParametros = this.getView().byId("panel-parametros"),
          oPadron = this.getView().byId("id-select-padron"),
          oBundle = this.getView().getModel("i18n").getResourceBundle(),
          MsgSeleccion = oBundle.getText("msgfichero"),
          MsgSociedad = oBundle.getText("msgsociedad"),
          MsgTpoRetencion = oBundle.getText("msgtporetencion"),
          MsgIdRetencion = oBundle.getText("msgidretencion"),
          oModel = this.getView().getModel(),
          oFileUploader = this.byId("id-carga-fichero"),
          oFile = oFileUploader.getParameters(File);

        if (!oSociedad.getSelectedKey()) {
          MessageToast.show(MsgSociedad);
          return;
        }

        if (!oRetencion.getSelectedKey()) {
          MessageToast.show(MsgTpoRetencion);
          return;
        }

        if (!oIdRetencion.getSelectedKey()) {
          MessageToast.show(MsgIdRetencion);
          return;
        }

        if (!oFileUploader.getValue()) {
          MessageToast.show(MsgSeleccion);
          return;
        } else {
          var oAddData = oPadron._getSelectedItemText();
          oFileUploader.setAdditionalData(oAddData);
        }
        oFileUploader
          .checkFileReadable()
          .then(
            function () {
              (that = this), (oView = this.getView());

              var oPost = {
                Archivo_Valor: oFilePost,
                Padron_Id: oPadron.getSelectedKey(),
                Sociedad_Id: oSociedad.getSelectedKey(),
                Indicador_Ret: oIdRetencion.getSelectedKey(),
                Tipo_Retencion: oRetencion.getSelectedKey(),
              };

              oView.setBusy(true);
              oModel.create("/ArchivoSet", oPost, {
                success: jQuery.proxy(function (oData) {
                  oView.setBusy(false);
                }, this),
                error: function (data) {
                  oView.setBusy(false);

                  var oDta = JSON.parse(data.responseText);
                  var oText = oDta.error.message.value;
                  MessageBox.error(oText, {
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function (sAction) {},
                  });
                },
              });

              //            oFileUploader.upload();
            },
            function (error) {
              MessageToast.show(MsgError);
            }
          )
          .then(function () {
            oFileUploader.clear();
            oPnlPadron.setExpanded(false);
            oPnlParametros.setExpanded(true);
          });
      },

      scrollFrom4to2: function () {
        this._wizard.goToStep(this.byId("origenArchivo_2"));
      },

      goFrom4to3: function () {
        if (this._wizard.getProgressStep() === this.byId("Tabla_4")) {
          this._wizard.previousStep();
        }
      },

      goFrom4to5: function () {
        if (this._wizard.getProgressStep() === this.byId("Tabla_4")) {
          this._wizard.nextStep();
        }
      },

      wizardCompletedHandler: function () {
        this._oNavContainer.to(this.byId("wizardReviewPage"));
      },

      backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
      },

      editStepOne: function () {
        this._handleNavigationToStep(0);
      },

      editStepTwo: function () {
        this._handleNavigationToStep(1);
      },

      editStepThree: function () {
        this._handleNavigationToStep(2);
      },

      _handleNavigationToStep: function (iStepNumber) {
        var fnAfterNavigate = function () {
          this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
          this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this.backToWizardContent();
      },

      _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
        MessageBox[sMessageBoxType](sMessage, {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.YES) {
              this._handleNavigationToStep(0);
              this._wizard.discardProgress(this._wizard.getSteps()[0]);
            }
          }.bind(this),
        });
      },

      handleWizardCancel: function () {
        this._handleMessageBoxOpen(
          "Are you sure you want to cancel your report?",
          "warning"
        );
      },

      handleWizardSubmit: function () {
        this._handleMessageBoxOpen(
          "Are you sure you want to submit your report?",
          "confirm"
        );
      },

      discardProgress: function () {
        this._wizard.discardProgress(this.byId("Parametros_1"));

        var clearContent = function (content) {
          for (var i = 0; i < content.length; i++) {
            if (content[i].setValue) {
              content[i].setValue("");
            }

            if (content[i].getContent) {
              clearContent(content[i].getContent());
            }
          }
        };
        clearContent(this._wizard.getSteps());
      },
    });
  }
);
