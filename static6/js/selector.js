

pimcore.registerNS("pimcore.plugin.esbackendsearch.selector");
pimcore.plugin.esbackendsearch.selector = Class.create({

    initialize: function () {
        this.panel = new Ext.Panel({
            layout: "border",
            border: false,
            items: [this.getForm(), this.getResultPanel()]
        });

        var windowConfig = {
            width: 1000,
            height: 550,
            modal: true,
            layout: "fit",
            items: [this.panel],
            tools: [{
                type: "maximize",
                tooltip: t("move_to_tab"),
                callback: this.moveToTab.bind(this)
            }]
        };

        this.window = new Ext.Window(windowConfig);
        
        this.window.show();
    },
    
    moveToTab: function () {

        // create new tab-panel
        this.myTabId = "pimcore_search_" + uniqid();

        this.tabpanel = new Ext.Panel({
            id: this.myTabId,
            iconCls: "pimcore_icon_search",
            title: t("plugin_esbackendsearch_open_saved_searches"),
            border: false,
            layout: "fit",
            closable:true,
            items: [this.panel]
        });

        var tabPanel = Ext.getCmp("pimcore_panel_tabs");
        tabPanel.add(this.tabpanel);
        tabPanel.setActiveItem(this.myTabId);

        pimcore.layout.refresh();

        this.window.close();
    },

    openSearch: function (data) {

        Ext.Ajax.request({
            url: "/plugin/ESBackendSearch/admin/load-search",
            params: {
                id: data.id
            },
            method: "get",
            success: function (response) {
                var rdata = Ext.decode(response.responseText);

                var tabId = "pimcore_search_" + data.id;
                try {
                    pimcore.globalmanager.get(tabId).activate();
                }
                catch (e) {
                    var esSearch = new pimcore.plugin.esbackendsearch.searchConfigPanel(rdata);
                    pimcore.globalmanager.add(esSearch.getTabId(), esSearch);
                }

                this.window.close();

            }.bind(this)
        });

    },


    getForm: function () {

        var compositeConfig = {
            xtype: "toolbar",
            items: [{
                xtype: "textfield",
                name: "query",
                width: 370,
                hideLabel: true,
                enableKeyEvents: true,
                listeners: {
                    "keydown" : function (field, key) {
                        if (key.getKey() == key.ENTER) {
                            this.search();
                        }
                    }.bind(this),
                    afterrender: function () {
                        this.focus(true,500);
                    }
                }
            }]
        };

        // add button
        compositeConfig.items.push({
            xtype: "button",
            text: t("search"),
            iconCls: "pimcore_icon_search",
            handler: this.search.bind(this)
        });

        if(!this.formPanel) {
            this.formPanel = new Ext.form.FormPanel({
                region: "north",
                bodyStyle: "padding: 2px;",
                items: [compositeConfig]
            });
        }

        return this.formPanel;
    },

    getResultPanel: function () {

        this.store = new Ext.data.Store({
            autoDestroy: true,
            remoteSort: true,
            autoLoad: true,
            pageSize: 50,
            proxy : {
                type: 'ajax',
                url: '/plugin/ESBackendSearch/admin/find',
                reader: {
                    type: 'json',
                    totalProperty: 'total',
                    successProperty: 'success',
                    rootProperty: 'data'
                }
            },
            fields: ["id","name","description","category","owner"]
        });

        if (!this.resultPanel) {
            var columns = [
                {header: 'ID', width: 40, sortable: true, dataIndex: 'id', hidden: true},
                {header: t("name"), flex: 200, sortable: true, dataIndex: 'name'},
                {header: t("description"), width: 200, sortable: true, dataIndex: 'description', hidden: true},
                {header: t("plugin_esbackendsearch_category"), width: 150, sortable: true, dataIndex: 'category'},
                {header: t("plugin_esbackendsearch_owner"), width: 150, sortable: false, dataIndex: 'ownerId', renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    return record.data.owner;
                }}
            ];

            this.pagingtoolbar = this.getPagingToolbar();

            this.resultPanel = Ext.create('Ext.grid.Panel', {
                region: "center",
                store: this.store,
                columns: columns,
                columnLines: true,
                stripeRows: true,
                viewConfig: {
                    forceFit: true,
                    xtype: 'patchedgridview'
                },
                plugins: ['gridfilters'],
                // selModel: Ext.create('Ext.selection.RowModel', {}),
                bbar: this.pagingtoolbar,
                listeners: {
                    rowdblclick: function (grid, record, tr, rowIndex, e, eOpts ) {

                        var data = grid.getStore().getAt(rowIndex);

                        this.openSearch(this.getData());
                    }.bind(this)
                }
            });
        }

        return this.resultPanel;
    },

    getGrid: function () {
        return this.resultPanel;
    },

    search: function () {
        var formValues = this.formPanel.getForm().getFieldValues();

        var proxy = this.store.getProxy();
        proxy.setExtraParam("query", formValues.query);

        this.pagingtoolbar.moveFirst();

        this.store.load();
    },


    getData: function () {
        var selected = this.getGrid().getSelectionModel().getSelected();
        if(selected) {
            return selected.getAt(0).data;
        }
        return null;
    },

    getPagingToolbar: function() {
        var pagingToolbar = pimcore.helpers.grid.buildDefaultPagingToolbar(this.store);
        return pagingToolbar;
    }

});