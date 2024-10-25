import { useEffect, useState } from 'react';
import { fetchReplacedParts, putReplacedParts } from '../../utils/api';
import { useAuth } from '../../hooks/AuthProvider';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Box,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { MuiFileInput } from 'mui-file-input';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const EditRepairedPart = () => {
  const auth = useAuth();
  const [replacedParts, setReplacedParts] = useState<string[]>([]);
  const [initialReplacedParts, setInitialReplacedParts] = useState<string[]>(
    [],
  );
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const newReplacedParts = await fetchReplacedParts(auth.token);
      setReplacedParts(newReplacedParts);
      setInitialReplacedParts(newReplacedParts);
    } catch (error) {
      console.error('Error fetching replacedParts:', error);
      alert(
        `Une erreur s'est produite lors de la récupération des données ${error}`,
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
        });
        const parts = json.flat();
        setReplacedParts(parts);
      };
      reader.readAsArrayBuffer(newFile);
    }
  };

  const handleSave = async () => {
    try {
      await putReplacedParts(auth.token, replacedParts);
      toast.success('Données sauvegardées avec succès');
    } catch (error) {
      console.error('Error saving replacedParts:', error);
      toast.error(
        "Une erreur s'est produite lors de la sauvegarde des données",
      );
    }
  };

  const isModified =
    JSON.stringify(replacedParts) !== JSON.stringify(initialReplacedParts);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <MuiFileInput
          value={file}
          onChange={handleFileUpload}
          placeholder="Importer un fichier Excel"
          clearIconButtonProps={{
            children: <CloseIcon fontSize="small" />,
          }}
          InputProps={{
            startAdornment: <AttachFileIcon />,
          }}
          inputProps={{ accept: '.xlsx, .xls' }}
          sx={{ margin: '16px 0' }}
        />
        {isModified && (
          <Button variant="contained" color="primary" onClick={handleSave}>
            Sauvegarder
          </Button>
        )}
      </Box>
      <List>
        {replacedParts.map((part, index) => (
          <ListItem
            key={part}
            sx={{
              borderTop: '1px solid #ccc',
              borderBottom:
                index === replacedParts.length - 1 ? '1px solid #ccc' : 'none',
            }}
          >
            <ListItemText primary={part} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default EditRepairedPart;
