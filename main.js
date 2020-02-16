/**
 * настройки дата-гридов
 */

var customerColumnDefs = [
    {headerName: 'Наименование организации', field: 'name', resizable: true,
        cellStyle: function(params) {
            var reg=/\w/i;
            var matchArr=params.value.toString().match(reg)||[];
            if ((params.value.length>100)||(matchArr.length>0)||(params.value.length===0)) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }},
    {headerName: 'ИНН организации', field: 'inn', resizable: true,
        cellStyle: function(params) {
            var reg=/\d\d\d\d\d\d\d\d\d\d\d\d/;
            var matchArr=params.value.toString().match(reg)||[];
            if ((matchArr.length===0)) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }},
    {headerName: 'Адрес организации', field: 'address', resizable: true}
];

var accountColumnDefs = [
    {headerName: 'ИНН организации', field: 'inn', resizable: true, editable:false, filter:true},
    {headerName: 'Счет', field: 'account', resizable: true,
        cellStyle: function(params) {
            var reg=/\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d/;
            var matchArr=params.value.toString().match(reg)||[];
            if ((matchArr.length===0)||(params.value.toString().length>20)) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }
    },
    {headerName: 'Название счета', field: 'name', resizable: true,
        cellStyle: function(params) {
            var reg=/\w/i;
            var matchArr=params.value.toString().match(reg)||[];
            if ((params.value.length>100)||(matchArr.length>0)) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }},
    {headerName: 'БИК банка', field: 'bank', resizable: true,
        cellStyle: function(params) {
            var reg=/\d\d\d\d\d\d\d\d\d/;
            var matchArr=params.value.toString().match(reg)||[];
            if ((matchArr.length===0)||(params.value.toString().length>9)) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }},
    {headerName: 'Остаток на счете', field: 'balance', resizable: true,
        cellStyle: function(params) {
            var reg=/\.\d\d$/;
            var reg2=/\.\d\d$/;
            var matchArr=params.value.toString().match(reg)||[];
            if ((matchArr.length===0)||(isNaN(params.value))) {
                //отметим все данные не удовлетворяющие условию
                return {backgroundColor: 'red'};
            } else {
                return {backgroundColor: 'white'};
            }
        }}
];

var accountGridOptions = {
    defaultColDef: {editable: true},
    columnDefs: accountColumnDefs,
    rowData: accountRowData,
    rowSelection:'single',
    rowDeselection:true
};

var customerGridOptions = {
    defaultColDef: {editable: true},
    columnDefs: customerColumnDefs,
    rowData: customerRowData,
    rowSelection:'single',
    rowDeselection:true,
    onSelectionChanged: onSelectionChanged
};

var gridCustomer;
var gridAccount;

/**
 * активация дата-гридов
 */
document.addEventListener('DOMContentLoaded', function() {
    gridCustomer = document.querySelector('#customerGrid');
    gridAccount = document.querySelector('#accountGrid');
    new agGrid.Grid(gridCustomer, customerGridOptions);
    new agGrid.Grid(gridAccount, accountGridOptions);
});

/**
 * данные подгружаем из текстовых файлов
 */
function loadData() {
    alert('данные подгружаются автоматически из файлов customer.js и account.js, расположенных в одноименном каталоге. просто перезагрузите страницу, предварительно сохранив то, что вы уже сделали.');
}

/**
 * @param {String} content – данные из таблицы
 * @param {String} fileName – имя файла
 * @param {String} contentType – тип данных
 */
function download(content, fileName, contentType) {
    var a = document.createElement('a');
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

/**
 * @param {String} table – таблица из которой сохраняем данные
 */
function saveData(table){
   switch (table) {
       case 'Customer':{
           var jsonData = 'var customerRowData = '+JSON.stringify(customerRowData)+';';
           download(jsonData, 'customer.js', 'text/javascript');
           break;
       }
       case  'Account':{
           var jsonData = 'var accountRowData = '+JSON.stringify(accountRowData)+';';
           download(jsonData, 'account.js', 'text/javascript');
       }
   }
}

/**
 * @param {String} table – таблица из которой удаляем выделенную строку
 */
function deleteRow(table) {
  switch (table) {
      case 'Customer':{
          try {
              if(customerGridOptions.api.getSelectedRows().length===0){throw 'ошибка';}
              var selectedRaws = customerGridOptions.api.getSelectedRows();
              var selectedRowID = customerGridOptions.api.getFocusedCell().rowIndex;
              var inn=selectedRaws[0].inn.toString();
              //Удаляем все привязанные к удаляемому клиенту счета
              if(accountGridOptions.api.getDisplayedRowCount()>0){
                 for(var i=0;i<accountRowData.length;i++){
                      if(accountRowData[i].inn.indexOf(inn)>-1){
                          accountRowData.splice(i,1);
                          i--;
                      }
                  }
                  accountGridOptions.api.setRowData(accountRowData);
              }
              customerRowData.splice(selectedRowID, 1);
              customerGridOptions.api.deselectAll();
              customerGridOptions.api.setRowData(customerRowData);
          }
          catch (e) {
              alert('Вы не выделили строку в таблице клиентов, которую нужно удалить');
          }
          break;
      }
      case 'Account':{
          try {
              if(accountGridOptions.api.getSelectedRows().length==0){throw 'ошибка';}
              var selectedRaw = accountGridOptions.api.getFocusedCell();
              accountRowData.splice(selectedRaw.rowIndex, 1);
              accountGridOptions.api.deselectAll();
              accountGridOptions.api.setRowData(accountRowData);
              onSelectionChanged();
          }
          catch (e) {
              alert('Вы не выделили строку в таблице счетов, которую нужно удалить');
          }
          break;
      }
  }
}

/**
 * @param {String} table – таблица в которую добавляем данные
 * */

function insertRow(table){
    switch (table){
        case 'Customer':{
            customerRowData.push({name: 'откорректируйте название и ИНН', inn: '1234567890', address:'' });
            customerGridOptions.api.setRowData(customerRowData);
            break;
        }
        case 'Account':{
            try{
                var selectedRows = customerGridOptions.api.getSelectedRows();
                var inn=selectedRows[0].inn.toString();
                accountRowData.push({inn: inn, ccount:12345678901234567890, name:'лицевой счет', bank:'123456789', balance:199.12 });
                accountGridOptions.api.setRowData(accountRowData);
                onSelectionChanged();
            }
            catch (e) {
                alert('выделите клиента, которому вы хотите добавить счет')
            }
        }
    }
}

/**
 * фильтрация счетов
 */
function onSelectionChanged() {
  try {
      var selectedRows = customerGridOptions.api.getSelectedRows();
      var inn = selectedRows[0].inn;
      var filterInn = inn.toString();
      var innFilterAccount = accountGridOptions.api.getFilterInstance('inn');
      console.log(innFilterAccount);
      innFilterAccount.setModel({
          type: 'contains',
          filter: filterInn
      });
      accountGridOptions.api.onFilterChanged();
      accountGridOptions.api.deselectAll();
      accountGridOptions.api.sizeColumnsToFit();
  }
  catch (e) {
      console.log('some selection problems)))')
  }
}