import React, { Component } from 'react';
import sortBy from 'sort-by';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

// Custom components
import EnhancedTableHead from './EnhancedTableHead';
import EnhancedSearch from './EnhancedSearch';

const styles = {
  root: {
    width: '100%',
    marginTop: -20,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
};

/**
 * This object is used for type checking the props of the component.
 */
const propTypes = {
  columnData: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  orderBy: PropTypes.string.isRequired,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.array,
  showSearchColumns: PropTypes.bool,
  isAdmin: PropTypes.bool,
  name: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onMultipleDelete: PropTypes.func,
};

/**
 * This object sets default values to the optional props.
 */
const defaultProps = {
  showSearchColumns: true,
  page: 0,
  rowsPerPage: 100,
  rowsPerPageOptions: [5, 10, 25, 50, 100],
  isAdmin: false,
  name: 'Default Table',
  onEdit: () => {},
  onDelete: () => {},
  onMultipleDelete: () => {},
  description: ''
};

/**
 * The custom table used at ambassadors and merchants.
 */
class EnhancedTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'asc',
      orderBy: this.props.orderBy,
      selected: [],
      data: this.props.data,
      page: this.props.page,
      rowsPerPage: this.props.rowsPerPage,
      searchQuery: '',
      searchColumns: this.props.columnData.filter(column => !column.disableSearch).map(column => {
        return {
          name: column.id,
          checked: true
        };
      }).sort(sortBy('name'))
    };
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if(orderBy === 'map') return;

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => {
          let a_value = (a[orderBy] !== undefined) ? a[orderBy]: '';
          let b_value = (b[orderBy] !== undefined) ? b[orderBy]: '';
          a_value = a_value.hasOwnProperty('searchText') ?  a_value.searchText.toLowerCase() : a_value.toLowerCase();
          b_value = b_value.hasOwnProperty('searchText') ?  b_value.searchText.toLowerCase() : b_value.toLowerCase();
          return (b_value < a_value) ? -1 : 1;
        })
        : this.state.data.sort((a, b) => {
          let a_value = (a[orderBy] !== undefined) ? a[orderBy]: '';
          let b_value = (b[orderBy] !== undefined) ? b[orderBy]: '';
          a_value = a_value.hasOwnProperty('searchText') ?  a_value.searchText.toLowerCase() : a_value.toLowerCase();
          b_value = b_value.hasOwnProperty('searchText') ?  b_value.searchText.toLowerCase() : b_value.toLowerCase();
          if(a_value.trim() === '') a_value = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
          if(b_value.trim() === '') b_value = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
          return (a_value < b_value) ? -1 : 1;
        });

    this.setState({ data, order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n._id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  /**
   * @description Update the query state and call the search.
   * @param {string} query - The search term.
   */
  updateQuery = (query) => {
    // If query is empty or undefined
    if (!query) {
      this.setState({searchQuery: ''});
      this.props.onSearchChange(this.props.data);
      return;
    }
    // Update the search field as soon as the character is typed
    this.setState({searchQuery: query});

    const searchQuery = query;
    const searchColumns = this.state.searchColumns;
    const data = this.filterData(this.props.data, searchQuery, searchColumns);

    this.props.onSearchChange(data);
  };

  // Sort the passed data based on the current component state.
  sortData = (data) => {
    const orderBy = this.state.orderBy;
    const order = this.state.order;

    data =
      order === 'desc'
        ? data.sort((a, b) => {
          let a_value = (a[orderBy] !== undefined) ? a[orderBy]: '';
          let b_value = (b[orderBy] !== undefined) ? b[orderBy]: '';
          a_value = a_value.hasOwnProperty('searchText') ?  a_value.searchText.toLowerCase() : a_value.toLowerCase();
          b_value = b_value.hasOwnProperty('searchText') ?  b_value.searchText.toLowerCase() : b_value.toLowerCase();
          return (b_value < a_value) ? -1 : 1;
        })
        : data.sort((a, b) => {
          let a_value = (a[orderBy] !== undefined) ? a[orderBy]: '';
          let b_value = (b[orderBy] !== undefined) ? b[orderBy]: '';
          a_value = a_value.hasOwnProperty('searchText') ?  a_value.searchText.toLowerCase() : a_value.toLowerCase();
          b_value = b_value.hasOwnProperty('searchText') ?  b_value.searchText.toLowerCase() : b_value.toLowerCase();
          if(a_value.trim() === '') a_value = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
          if(b_value.trim() === '') b_value = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
          return (a_value < b_value) ? -1 : 1;
        }
      );
    return data;
  };

  /*
   * Update the search column select box
   */
  updateSearchColumn = name => () => {
    const value = !(this.state.searchColumns.filter((c) => c.name === name)[0].checked);
    const columns = this.state.searchColumns.filter((c) => c.name !== name);
    columns.push({name: name, checked: value});
    this.setState({searchColumns: columns.sort(sortBy('name'))});
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  filterData(data, searchQuery, searchColumns) {
    // Remove white spaces and wrong "" split
    const queryTerms = searchQuery.split(' ').filter(value => value !== '');

    return data.filter((item) => {

      const insertArray = [];
      // Implement hardcoded AND query over each column
      // Iterate over each search term
      queryTerms.forEach(searchItem => {
        let insert = false;
        // Iterate over the search column select boxes
        searchColumns.map(column => {
          try {
            if( column.checked && (item[column.name] !== undefined) ) {
              if(item[column.name].hasOwnProperty('searchText') &&
                item[column.name].searchText.toLowerCase().indexOf(searchItem.toLowerCase().trim()) !== -1
              ){
                insert = true;
              }
              else if(item[column.name].toLowerCase().indexOf(searchItem.toLowerCase().trim()) !== -1){
                insert = true;
              }
            }
          }
          catch(error) {
            //console.error(error);
          }
          return column;
        });

        insertArray.push(insert);
      });

      // AND logic
      if(insertArray.filter(item => !item).length === 0){
        return item;
      }
      return false;
    });
  }

  render() {
    let { data } = this.props;
    const { columnData, rowsPerPageOptions, showSearchColumns } = this.props;
    const { order, orderBy, selected, rowsPerPage, page, searchQuery, searchColumns } = this.state;

    // Logic of search query and columns
    if(searchQuery.length > 0) {
      data = this.filterData(data, searchQuery, searchColumns);
    }

    data = this.sortData(data);

    return (
      <div style={styles.root}>
        <EnhancedSearch
          textComponent={this.props.description}
          query={searchQuery}
          columns={searchColumns}
          showSearchColumns={showSearchColumns}
          onUpdateQuery={this.updateQuery}
          onColumnChange={this.updateSearchColumn}
        />
        <div style={styles.tableWrapper}>
          <Table style={styles.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              columnData={columnData}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              isAdmin={this.props.isAdmin}
            />
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                const isSelected = this.isSelected(n._id);
                return (
                  <TableRow
                    role="checkbox"
                    aria-checked={false}
                    tabIndex={-1}
                    key={this.props.name + '-trow-' + n._id}
                    selected={false}
                  >
                    {this.props.isAdmin &&
                    <TableCell padding="checkbox" style={{margin: 'auto 0', textAlign: 'center', padding: 0}}>
                      <Checkbox checked={isSelected} onClick={event => this.handleClick(event, n._id)} />
                    </TableCell>
                    }
                    {this.props.columnData.map(column => (
                      <TableCell
                        key={this.props.name + '-data-' + column.id}
                        component="th" scope="row" padding="none"
                        style={{margin: 'auto 0', textAlign: 'center', padding: 0}}
                      >{
                          ((n[column.id]) !== undefined && (n[column.id]) !== null) ?
                            ( (n[column.id]).hasOwnProperty('value') ?
                              n[column.id].value : n[column.id]
                            )
                          :
                          n[column.id]
                        }
                      </TableCell>
                      ))}
                    {this.props.isAdmin &&
                    <TableCell key={this.props.name + '-edit-' + n._id}
                      component="th" scope="row" padding="none"
                      style={{margin: 'auto 0', textAlign: 'center', padding: 0}}
                    >
                      <Button
                        className="App-button"
                        variant="contained"
                        color="primary"
                        onClick={() => this.props.onEdit(n._id)}
                      >Edit
                      </Button>
                    </TableCell>
                    }
                    {this.props.isAdmin &&
                    <TableCell key={this.props.name + '-delete-' + n._id}
                      component="th" scope="row" padding="none"
                      style={{margin: 'auto 0', textAlign: 'center', padding: 0}}
                    >
                      <Button
                        className="App-button"
                        variant="contained"
                        color="secondary"
                        onClick={() => this.props.onDelete(n._id)}
                      >Delete
                      </Button>
                    </TableCell>
                    }
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </div>
    );
  }
}

// Type checking the props of the component
EnhancedTable.propTypes = propTypes;
// Assign default values to the optional props
EnhancedTable.defaultProps = defaultProps;

export default EnhancedTable;
