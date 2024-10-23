import React, { MouseEventHandler, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../hooks/AuthProvider';
import { useTheme } from '@mui/material/styles';
import type { ColDef } from 'ag-grid-community/dist/types/core/entities/colDef';
import { AG_GRID_LOCALE_FR } from '@ag-grid-community/locale';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/MachineRepairsTable.css';
import { getAllMachineRepairs } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import _colorByState from '../config/color_state.json';

const colorByState: { [key: string]: string } = _colorByState;

interface MachineRepair {
  id: string;
  first_name: string;
  last_name: string;
  state: string | null;
  address: string;
  phone: string;
  email: string;
  machine_type: string;
  repair_or_maintenance: string;
  createdAt: string;
}
const rowHeight = 40;

const MachineRepairsTable: React.FC = () => {
  const auth = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const gridRef = React.createRef<AgGridReact>();
  const [machineRepairs, setMachineRepairs] = useState<MachineRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationPageSize, setPaginationPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllMachineRepairs(auth.token);
      setMachineRepairs(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert("Une erreur s'est produite lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculatePageSize();
  }, [machineRepairs]);

  const columns: ColDef<MachineRepair>[] = [
    {
      headerName: '',
      field: 'id',
      cellRenderer: (params: { value: number }) => (
        <>
          <Tooltip title="Ouvrir" arrow>
            <IconButton
              color="primary"
              component="a"
              href={`/reparation/${params.value}`}
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                navigate(`/reparation/${params.value}`);
              }}
              // sx={{ paddingRight: 0 }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ouvrir dans un nouvel onglet" arrow>
            <IconButton
              color="primary"
              component="a"
              href={`/reparation/${params.value}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
      // minWidth: 70,
      width: 120,
      // maxWidth: 110,
      cellStyle: {
        // paddingLeft: 0,
        // paddingRight: 0,
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
      },
    },
    {
      headerName: 'ID',
      field: 'id' as keyof MachineRepair,
      sortable: true,
      filter: true,
      width: 80,
    },
    {
      headerName: 'État',
      field: 'state' as keyof MachineRepair,
      sortable: true,
      filter: true,
      valueFormatter: (params: any) =>
        !params.value ? 'Non commencé' : params.value,
      cellStyle: (params: any) => ({
        backgroundColor: colorByState[params.value || 'Non commencé'],
      }),
    },
    {
      headerName: 'Type',
      field: 'repair_or_maintenance' as keyof MachineRepair,
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: 'Type de machine',
      field: 'machine_type' as keyof MachineRepair,
    },
    {
      headerName: 'Prénom',
      field: 'first_name' as keyof MachineRepair,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Nom',
      field: 'last_name' as keyof MachineRepair,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Téléphone',
      field: 'phone' as keyof MachineRepair,
      filter: true,
    },
    {
      headerName: 'Email',
      field: 'email' as keyof MachineRepair,
      filter: true,
    },
    {
      headerName: 'Date de création',
      field: 'createdAt' as keyof MachineRepair,
      sortable: true,
      unSortIcon: true,
      filter: 'agDateColumnFilter',
      sort: 'desc', // Tri par défaut par cette colonne, en ordre décroissant
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString('fr-FR'),
      comparator: (valueA: string, valueB: string) =>
        new Date(valueA).getTime() - new Date(valueB).getTime(),
    },
  ];

  const calculatePageSize = () => {
    const element = document.getElementById('machine-repairs-table');
    const footer = document.querySelector('.ag-paging-panel');
    const header = document.querySelector('.ag-header-viewport');
    if (element && footer && header) {
      const elementHeight = element.clientHeight;
      const footerHeight = footer.clientHeight;
      const headerHeight = header.clientHeight;
      const newPageSize = Math.floor(
        (elementHeight - headerHeight - footerHeight) / rowHeight,
      );
      setPaginationPageSize(newPageSize);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', calculatePageSize);
    return () => {
      window.removeEventListener('resize', calculatePageSize);
    };
  }, []);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16 }}>
        <Typography variant="h6">Réparations/Entretiens</Typography>
      </div>
      <div
        id="machine-repairs-table"
        className={`machine-repairs-table ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''}`}
        style={{ height: '100%', width: '100%' }}
      >
        <AgGridReact
          rowHeight={rowHeight}
          ref={gridRef}
          rowData={machineRepairs}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={paginationPageSize}
          localeText={AG_GRID_LOCALE_FR}
          autoSizeStrategy={{
            type: 'fitGridWidth',
          }}
        />
      </div>
    </Paper>
  );
};

export default MachineRepairsTable;
