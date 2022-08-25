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
  
        selectArchivoServer: function() {
          this.getView().byId("id-file-upload").setVisible(false);
        },
  
        selectArchivoLocal: function() {
          this.getView().byId("id-file-upload").setVisible(true);
        },

        onEjecutar: function() {
          var oSociedad= this.getView().byId("id-sociedad-p1");
          var oRetencion= this.getView().byId("id-select-retenciones");
          var oIdRetencion= this.getView().byId("id-select-idretencion");

          
        },

        onUploadCompleto: function() {
        this.getView().byId("id-btn-upload").setVisible(true);
        var MsgUpload =  this.getView().getModel("i18n").getResourceBundle().getText("msgcarga");
          MessageToast.show(MsgUpload);
        },
  
  
        parametrosActivacion: function () {
          
        },
  
        tablaActivacion: function () {
          this.model.setProperty("/navApiEnabled", true);
        },
  
        tablaCompleta: function () {
          this.model.setProperty("/navApiEnabled", false);
        },
  
        onFileupload: function() {

          var oPnlPadron=this.getView().byId("panel-padron"),
            oPnlParametros = this.getView().byId("panel-parametros"),
            oPadron=  this.getView().byId("id-select-padron"),
            MsgSeleccion =  this.getView().getModel("i18n").getResourceBundle().getText("msgseleccion"),
            MsgError =  this.getView().getModel("i18n").getResourceBundle().getText("msgerror");


          var oFileUploader = this.byId("id-carga-fichero");
          if (!oFileUploader.getValue()) {
            MessageToast.show(MsgSeleccion);
            return;
          } else {
           var oAddData =oPadron._getSelectedItemText();
           oFileUploader.setAdditionalData(oAddData);
          }
          oFileUploader.checkFileReadable().then(function() {
            oFileUploader.upload();
          }, function(error) {
            MessageToast.show(MsgError);
          }).then(function() {
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
  