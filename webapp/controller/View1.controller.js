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
        this._oradioButton = this.getView().byId("id-rbt-SelectArchivo");        
      },
            
      onAfterRendering : function() {    
      },
            
      // Eventos del Radiobutton

      selectArchivoServer: function () {
        this.getView().byId("id-file-upload").setVisible(false);
        this.getView().byId("id-file-uploadCollection").setVisible(true);
      },

      selectArchivoLocal: function () {
        this.getView().byId("id-file-upload").setVisible(true);
        this.getView().byId("id-file-uploadCollection").setVisible(false);
      },

      tablaActivacion: function () {
        this.model.setProperty("/navApiEnabled", true);
      },

      tablaCompleta: function () {
        this.model.setProperty("/navApiEnabled", false);
      },

      // Pasos Wizard

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

      // Evento Seleccion de Ficheros FILEUPLOADER

      onUploadChange: function (e) {
        var oPnlPadron = this.getView().byId("panel-padron"),
          i18nObundle = this.getView().getModel("i18n").getResourceBundle(),
          oRbut = this.getView().byId("id-rbt-SelectArchivo"),
          oPnlParametros = this.getView().byId("panel-parametros"),
          MsgUpload = i18nObundle.getText("msgcarga");
        MessageToast.show(MsgUpload);

        if (oRbut.getSelectedIndex() === 0) {
          // Opcion fichero en Backend
        } else {
          oPnlPadron.setExpanded(false);
          oPnlParametros.setExpanded(true);
        }
      },

      onFileupload: function () {
        var oSociedad = this.getView().byId("id-sociedad-p1"),
          i18nObundle = this.getView().getModel("i18n").getResourceBundle(),
          oRetencion = this.getView().byId("id-select-retenciones"),
          oIdRetencion = this.getView().byId("id-select-idretencion"),
          oPadron = this.getView().byId("id-select-padron"),
          MsgSeleccion = i18nObundle.getText("msgfichero"),
          MsgSociedad = i18nObundle.getText("msgsociedad"),
          MsgTpoRetencion = i18nObundle.getText("msgtporetencion"),
          MsgIdRetencion = i18nObundle.getText("msgidretencion"),
          oFileUploader = this.byId("id-carga-fichero"),
          oFile = sap.ui.getCore()._file[0],
          that = this;

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
        }

        this.filename = oFile.name;
        this.filetype = oFile.type;
        this.sociedad = oSociedad.getSelectedKey();
        this.padron = oPadron.getSelectedKey();
        this.idretencion = oIdRetencion.getSelectedKey();
        this.retencion = oRetencion.getSelectedKey();

        var reader = new FileReader();

        reader.addEventListener("loadend", function (e) {
          that.onPostFile(
            e.currentTarget.result,
            that.padron,
            that.sociedad,
            that.idretencion,
            that.retencion
          );
        });

        reader.readAsText(oFile);
      },

      // Carga el Fichero Local FILEUPLOADER
      onPostFile: function (odataFile, oPad, oSoc, oIdRet, oRet) {
        var MsgCargado = i18nObundle.getText("msgresultado"),
          oPnlParametros = this.getView().byId("panel-parametros"),
          oPnlResultado = this.getView().byId("id-pnl-resultado-p1");

        this.getView().setBusy(true);

        var oPost = {
          Archivo_Valor: odataFile,
          Padron_Id: oPad,
          Sociedad_Id: oSoc,
          Indicador_Ret: oIdRet,
          Tipo_Retencion: oRet,
        };

        this.getView()
          .getModel()
          .create("/ArchivoSet", oPost, {
            success: jQuery.proxy(function (oData) {
              this.getView().setBusy(false);

              MessageToast.show(MsgCargado);
              oPnlParametros.setExpanded(false);
              oPnlResultado.setExpanded(true);
              oPnlResultado.setVisible(true);
            }, this),
            error: function (data) {
              this.getView().setBusy(false);
              var oDta = JSON.parse(data.responseText);
              var oText = oDta.error.message.value;
              MessageBox.error(oText, {
                actions: [MessageBox.Action.CLOSE],
                onClose: function (sAction) {},
              });
            },
          });
      },

      //  Upload Files

      onEditaFile: function (oEvent) {
        var oControl = oEvent.getSource(),
          oNumInt;

        gDivision = this.byId("detailview")
          .getBindingContext()
          .getProperty("Division");

        oNumInt = oTable.getBindingContext().getProperty("Num_Interv");
        var oUploadCollection = sap.ui.core.Fragment.byId(
          "AltaIntervencion",
          "UploadCollectionMD"
        );
        var oFilter2 = new Filter("Nro_Ficha", FilterOperator.EQ, gOrder);

        oUploadCollection.getBinding("items").filter([oFilter2, oFilter3]);

        gNumIntervencion = oNumInt;
      },

      onChange: function (oEvent) {
        var oUploadCollection = oEvent.getSource();

        var oCustomerHeaderToken = new UploadCollectionParameter({
          name: "x-csrf-token",
          value: this.getView().getModel().getSecurityToken(),
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
      },

      onFileDeleted: function (oEvent) {
        var oUploadCollection = this.getView().byId("UploadCollection"),
          that = this;
        var oItem = oUploadCollection.getSelectedItem();
        var oModel = this.getView().getModel();
        var sPath = oItem.getBindingContext().getPath();

        MessageBox.warning(oItem.getFileName(), {
          icon: MessageBox.Icon.WARNING,
          title: "Eliminar Fichero",
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.CANCEL,
          initialFocus: MessageBox.Action.CANCEL,
          onClose: function (sAction) {
            if (sAction === "OK") {
              oModel.remove(sPath, {
                success: function () {
                  oUploadCollection.getBinding("items").refresh();
                  sap.ui.core.Fragment.byId(
                    "AltaIntervencion",
                    "downloadButton"
                  ).setEnabled(false);
                  sap.ui.core.Fragment.byId(
                    "AltaIntervencion",
                    "deleteButton"
                  ).setEnabled(false);
                },
                error: function (data) {
                  var oData = JSON.parse(data.responseText);
                  var oText = oData.error.message.value;

                  sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
                    MessageBox.show(oText, {
                      icon: MessageBox.Icon.ERROR,
                      title: that.i18nBundle.getText("changeerror"),
                    });
                  });
                },
              });
            }
          },
        });
      },

      onFilenameLengthExceed: function (oEvent) {
        var i18nObundle = this.getView().getModel("i18n").getResourceBundle();
        MessageToast.show(i18nObundle.getText("msgfilename"));
      },

      onFileSizeExceed: function (oEvent) {
        var i18nObundle = this.getView().getModel("i18n").getResourceBundle();
        MessageToast.show(i18nObundle.getText("msgfilesize"));
      },

      onTypeMissmatch: function (oEvent) {
        var i18nObundle = this.getView().getModel("i18n").getResourceBundle();
        MessageToast.show(i18nObundle.getText("msgtype"));
      },

      onFilePress: function (oEvent) {},

      onDownloadItem: function (oEvent) {
        var oUploadCollection = this.getView().byId("UploadCollection"),
          oItem = oUploadCollection.getSelectedItem(),
          oFilename = oItem.getFileName(),
          sPath = oItem.getBindingContext().getPath(),
          oFile = window.document.createElement("a");

        oFile.href =
          "/sap/opu/odata/sap/ZFIOD_IIBB_PADRON_UPLOAD_SRV" + sPath + "/$value";
        oFile.download = oFilename;
        document.body.appendChild(oFile);
        oFile.click();
        document.body.removeChild(oFile);
      },

      onBeforeUploadStarts: function (oEvent) {
        var fileName = oEvent.getParameter("fileName");
        // Header Slug  MODIFICAR!!!!!!!!

        var oCustomerHeaderSlug = new UploadCollectionParameter({
          name: "slug",
          value: gOrder + ";" + gNumIntervencion + ";" + fileName,
        });
        var oUploadCollection = oEvent.getSource();
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      },

      onUploadComplete: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
        MessageToast.show("Upload Completado");
      },

      onSelectionChange: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
      },

      onSelectChange: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.setShowSeparators(
          oEvent.getParameters().selectedItem.getProperty("key")
        );
      },
    });
  }
);
