import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const TableHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  textTransform: 'none',
}));

// Sample data - replace with your actual data
const createData = (
  id: number,
  name: string,
  email: string,
  role: string,
  status: 'active' | 'inactive' | 'pending',
  lastLogin: string
) => {
  return { id, name, email, role, status, lastLogin };
};

const rows = [
  createData(1, 'John Doe', 'john@example.com', 'Admin', 'active', '2023-05-15 10:30'),
  createData(2, 'Jane Smith', 'jane@example.com', 'User', 'inactive', '2023-05-14 15:45'),
  createData(3, 'Bob Johnson', 'bob@example.com', 'Editor', 'pending', '2023-05-13 09:20'),
  // Add more sample data as needed
];

const DataTableLayout: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <Box sx={{ width: '100%' }}>
      <StyledPaper>
        <TableHeader>
          <Typography variant="h6" component="div">
            Users
          </Typography>
          <Box>
            <TextField
              size="small"
              placeholder="Search..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filter list">
              <IconButton onClick={handleFilterClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More options">
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </TableHeader>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <ActionButton
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              size="small"
            >
              Export
            </ActionButton>
            <ActionButton
              variant="outlined"
              startIcon={<PrintIcon />}
              size="small"
              sx={{ ml: 1 }}
            >
              Print
            </ActionButton>
          </Box>
          
          <Box>
            <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="all">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {}}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${row.id}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(event) => handleClick(event, row.id)}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'active'
                            ? 'success'
                            : row.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{row.lastLogin}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {selected.length} of {rows.length} selected
          </Typography>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </StyledPaper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={handleFilterClose}>Filter by Status</MenuItem>
        <MenuItem onClick={handleFilterClose}>Filter by Role</MenuItem>
        <MenuItem onClick={handleFilterClose}>Clear All Filters</MenuItem>
      </Menu>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewColumnIcon fontSize="small" sx={{ mr: 1 }} />
          Columns
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export All
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Delete Selected
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DataTableLayout;
