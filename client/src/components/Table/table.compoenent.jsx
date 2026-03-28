import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const TableComponent = ({
  rows = [],
  columns = [],
  handleClick,
  handleDelete,
  handleEdit,
  handleView,
  getRowId = (row) => row.id || row.key,
  emptyMessage = "No Data Found",
  isAdmin = false,
}) => {
  const hasActions = handleDelete || handleEdit || handleView;

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto",
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        '& .MuiTableCell-root': {
          padding: '14px 18px',
          fontSize: '0.85rem',
          borderBottom: '1px solid #F1F5F9'
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            }}
          >
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem !important',
                  letterSpacing: '0.06em',
                  borderBottom: 'none !important',
                  whiteSpace: 'nowrap',
                  '&:first-of-type': {
                    borderRadius: '16px 0 0 0'
                  },
                  '&:last-of-type': {
                    borderRadius: hasActions ? '0' : '0 16px 0 0'
                  }
                }}
              >
                {col.headerName}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem !important',
                  letterSpacing: '0.06em',
                  borderBottom: 'none !important',
                  borderRadius: '0 16px 0 0'
                }}
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <TableRow
                key={getRowId(row)}
                hover
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  cursor: handleClick ? 'pointer' : 'default',
                  backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                  '&:hover': {
                    backgroundColor: '#EEF2FF !important',
                    boxShadow: 'inset 3px 0 0 #6366F1',
                  },
                  '&:last-child td': {
                    borderBottom: 'none'
                  }
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={`${getRowId(row)}-${col.field}`}
                    onClick={() => handleClick?.(getRowId(row))}
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#334155',
                      fontWeight: 400
                    }}
                  >
                    {col.renderCell ? col.renderCell({ value: row[col.field], row }) : row[col.field]}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Box display="flex" gap={0.5}>
                      {handleView && (
                        <Tooltip title="View">
                          <IconButton
                            aria-label="view"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(getRowId(row));
                            }}
                            size="small"
                            sx={{
                              color: '#06B6D4',
                              backgroundColor: '#ECFEFF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                backgroundColor: '#CFFAFE'
                              }
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(handleEdit && isAdmin) && (
                        <Tooltip title="Edit">
                          <IconButton
                            aria-label="edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(getRowId(row));
                            }}
                            size="small"
                            sx={{
                              color: '#6366F1',
                              backgroundColor: '#EEF2FF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                backgroundColor: '#E0E7FF'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(handleDelete && isAdmin) && (
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(getRowId(row));
                            }}
                            size="small"
                            sx={{
                              color: '#EF4444',
                              backgroundColor: '#FEF2F2',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                backgroundColor: '#FEE2E2'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                align="center"
                sx={{ py: 6, color: '#94A3B8', fontWeight: 500, fontSize: '0.9rem' }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent;