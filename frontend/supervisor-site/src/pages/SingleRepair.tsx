import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Modal,
  ImageList,
  ImageListItem,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  fetchRepairById,
  fetchRepairers,
  fetchReplacedParts,
  updateRepair,
} from '../utils/api';
import { useAuth } from '../hooks/AuthProvider';
import '../styles/SingleRepair.css';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useTheme } from '@mui/material/styles';
import { getKeys } from '../utils/common.utils';
import Divider from '@mui/material/Divider';
import _colorByState from '../config/color_state.json';
import { toast } from 'react-toastify';

const colorByState: { [key: string]: string } = _colorByState;

interface MachineRepair {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  email: string;
  machine_type: string;
  repair_or_maintenance: string;
  robot_code: string;
  fault_description: string;
  working_time_hour: number | null;
  working_time_minute: number | null;
  replaced_part_list: string[];
  state: string | null;
  createdAt: string;
  imageUrls: string[];
  signatureUrl: string;
  machine_brand: string;
  warranty?: boolean;
  repairer_name: string | null;
}

const SingleRepair = () => {
  const theme = useTheme();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<null | MachineRepair>(null);
  const [initialRepair, setInitialRepair] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);
  const [editableFields, setEditableFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [editableSections, setEditableSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replacedParts, setReplacedParts] = useState<string[]>([]);
  const [repairers, setRepairers] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newReplacedParts = await fetchReplacedParts(auth.token);
        setReplacedParts(newReplacedParts);
      } catch (error) {
        console.error('Error fetching replacedParts:', error);
        alert(
          `Une erreur s'est produite lors de la récupération des données ${error}`,
        );
      }
    };
    fetchData();

    const fetchRepairersData = async () => {
      try {
        const repairersData = await fetchRepairers(auth.token);
        setRepairers(repairersData);
      } catch (error) {
        console.error('Error fetching repairers:', error);
        alert(
          `Une erreur s'est produite lors de la récupération des données ${error}`,
        );
      }
    };
    fetchRepairersData();
  }, []);

  useEffect(() => {
    if (!id) {
      alert('ID invalide');
      return;
    }
    const fetchData = async () => {
      try {
        const repairData: MachineRepair = await fetchRepairById(id, auth.token);
        setRepair(repairData);
        setInitialRepair(repairData);
      } catch (error) {
        console.error('Error fetching repair:', error);
        alert(
          `Une erreur s'est produite lors de la récupération des données ${error}`,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, auth.token]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepair({ ...repair, [e.target.name]: e.target.value } as MachineRepair);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepair({
      ...repair,
      [e.target.name]: e.target.checked,
    } as MachineRepair);
  };

  const handleMultipleSelectChange = (event: SelectChangeEvent<String[]>) => {
    setRepair({
      ...repair,
      [event.target.name]: event.target.value,
    } as MachineRepair);
  };

  const handleSelectChange = (event: SelectChangeEvent<String>) => {
    setRepair({
      ...repair,
      [event.target.name]: event.target.value,
    } as MachineRepair);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(String(e.target.value).replace(/\D/g, ''));
    if (!isNaN(value)) {
      setRepair({ ...repair, [e.target.name]: value } as MachineRepair);
    }
  };

  const toggleEditableField = (field: string) => {
    setEditableFields({ ...editableFields, [field]: !editableFields[field] });
  };

  const toggleEditableSection = (section: string, fields: string[]) => {
    const isSectionEditable = !editableSections[section];
    setEditableSections({ ...editableSections, [section]: isSectionEditable });
    fields.forEach((field) => {
      setEditableFields((prev) => ({ ...prev, [field]: isSectionEditable }));
    });
  };

  const closeAllEditableSections = () => {
    setEditableSections({});
    setEditableFields({});
  };

  const handleUpdate = async () => {
    if (!repair) {
      console.error('No repair data found');
      return;
    }

    setLoading(true);

    const updatedData: Record<keyof MachineRepair, any> = getKeys(
      repair,
    ).reduce((acc: any, key: keyof MachineRepair) => {
      if (repair[key] !== initialRepair[key]) {
        acc[key] = repair[key];
      }
      return acc;
    }, {});

    try {
      await updateRepair(auth.token, id!, updatedData);
      // alert('Fiche mise à jour avec succès');
      toast.success('Fiche mise à jour avec succès');
      setInitialRepair(repair);
    } catch (error) {
      console.error('Error updating repair:', error);
      toast.error(
        "Une erreur s'est produite lors de la mise à jour de la réparation",
      );
    } finally {
      setLoading(false);
      closeAllEditableSections();
    }
  };

  const hasChanges = JSON.stringify(repair) !== JSON.stringify(initialRepair);

  const renderCheckbox = (label: string, name: string, value: boolean) => (
    <Grid item xs={6}>
      {editableFields[name] ? (
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              name={name}
              onChange={handleCheckboxChange}
              checked={value}
            />
          }
        />
      ) : (
        <Box display={'flex'} gap={'10px'}>
          <Typography variant="subtitle1">{label} :</Typography>
          <Typography variant="subtitle1">{value ? 'Oui' : 'Non'}</Typography>
        </Box>
      )}
    </Grid>
  );

  const renderField = (
    label: string,
    name: string,
    value: string,
    isMultiline: boolean = false,
  ) => (
    <Grid item xs={isMultiline ? 12 : 6}>
      {editableFields[name] ? (
        <TextField
          sx={{ margin: '5px 0' }}
          fullWidth
          label={label}
          name={name}
          value={value || ''}
          onChange={handleChange}
          multiline={isMultiline}
          rows={isMultiline ? 4 : 1}
        />
      ) : (
        <Box
          display={'flex'}
          flexDirection={isMultiline ? 'column' : 'row'}
          gap={isMultiline ? '0' : '10px'}
          margin={'5px 0'}
        >
          <Typography variant="subtitle1" noWrap>
            {label} :
          </Typography>
          <Typography variant="subtitle1" sx={{ overflowWrap: 'break-word' }}>
            {value || ''}
          </Typography>
        </Box>
      )}
    </Grid>
  );

  const renderTimePicker = () => {
    if (!repair) {
      return null;
    }
    return (
      <Grid item xs={6}>
        <Box
          display={'flex'}
          flexDirection={'row'}
          gap={'10px'}
          margin={'5px 0'}
        >
          <Typography
            variant="subtitle1"
            noWrap
            width={editableFields['working_time'] ? 180 : undefined}
          >
            Temps passé :
          </Typography>
          {editableFields['working_time'] ? (
            <>
              <TextField
                label={'Heure'}
                name={'working_time_hour'}
                value={repair.working_time_hour ?? 0}
                onChange={handleTimeChange}
              ></TextField>
              <TextField
                label={'Minute'}
                name={'working_time_minute'}
                value={repair.working_time_minute ?? 0}
                onChange={handleTimeChange}
              ></TextField>
            </>
          ) : (
            <Typography variant="subtitle1">
              {repair.working_time_hour ?? 0}h {repair.working_time_minute ?? 0}
              m
            </Typography>
          )}
        </Box>
      </Grid>
    );
  };

  const renderSelect = (
    label: string,
    name: string,
    value: string,
    possibleValues: string[],
    colorByValue: { [key: string]: string } = {},
  ) => {
    return (
      <Grid item xs={12}>
        {editableFields[name] ? (
          <FormControl sx={{ marginTop: 2, marginBottom: 1, width: '80%' }}>
            <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              value={value}
              name={name}
              onChange={handleSelectChange}
              input={<OutlinedInput id="select-multiple-chip" label={label} />}
              // sx={{ backgroundColor: colorByValue[value] }}
            >
              {possibleValues.map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box display={'flex'} gap={'10px'} margin={'5px 0'}>
            <Typography variant="subtitle1">{label} :</Typography>
            <Typography
              variant="subtitle1"
              sx={{
                backgroundColor: colorByValue[value],
                color: colorByValue[value] && 'black',
                paddingLeft: colorByValue[value] && 2,
                paddingRight: colorByValue[value] && 2,
              }}
            >
              {value}
            </Typography>
          </Box>
        )}
      </Grid>
    );
  };

  const renderMultiSelect = (
    label: string,
    name: string,
    values: string[],
    possibleValues: string[],
  ) => {
    return (
      <Grid item xs={12}>
        {editableFields[name] ? (
          <FormControl sx={{ marginTop: 2, marginBottom: 1, width: '80%' }}>
            <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              value={values}
              name={name}
              onChange={handleMultipleSelectChange}
              input={<OutlinedInput id="select-multiple-chip" label={label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {possibleValues.map((val) => (
                <MenuItem key={val} value={val}>
                  <Checkbox checked={values.includes(val)} />
                  <ListItemText primary={val} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box
            display={'flex'}
            flexDirection={'row'}
            gap={'10px'}
            margin={'5px 0'}
          >
            <Typography variant="subtitle1">{label} :</Typography>
            <Typography variant="subtitle1">
              {values.length ? values.join(', ') : 'Aucune'}
            </Typography>
          </Box>
        )}
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 4 }}>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            zIndex: 100,
            width: '100vw',
            top: 0,
            right: 0,
          }}
        >
          <CircularProgress size={'4rem'} />
        </Box>
      )}
      <Grid container spacing={2} display={'flex'}>
        <Grid item xs={6}>
          <Typography variant="h4" gutterBottom>
            Fiche n°{id}
          </Typography>
        </Grid>
        <Grid item xs={6} display={'flex'} flexDirection={'row-reverse'}>
          {hasChanges && (
            <Button variant="contained" onClick={handleUpdate}>
              Sauvegarder les modifications
            </Button>
          )}
        </Grid>
      </Grid>
      {repair && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Détails</Typography>
                <IconButton
                  onClick={() =>
                    toggleEditableSection('repairDetails', [
                      'machine_type',
                      'repair_or_maintenance',
                      'fault_description',
                      'robot_code',
                      'machine_brand',
                      'warranty',
                    ])
                  }
                >
                  {editableSections['repairDetails'] ? (
                    <SaveIcon />
                  ) : (
                    <EditIcon />
                  )}
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField(
                'Type de machine',
                'machine_type',
                repair.machine_type,
              )}
              {renderField(
                'Type',
                'repair_or_maintenance',
                repair.repair_or_maintenance,
              )}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField('Marque', 'machine_brand', repair.machine_brand)}
              {renderCheckbox('Garantie', 'warranty', repair.warranty ?? false)}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField(
                'Code du robot',
                'robot_code',
                repair.robot_code || '',
              )}
            </Grid>
            <Grid item xs={12} display={'flex'}>
              {renderField(
                'Description',
                'fault_description',
                repair.fault_description,
                true,
              )}
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Coordonnées du client</Typography>
                <IconButton
                  onClick={() =>
                    toggleEditableSection('clientInfo', [
                      'first_name',
                      'last_name',
                      'address',
                      'phone',
                      'email',
                    ])
                  }
                >
                  {editableSections['clientInfo'] ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField('Prénom', 'first_name', repair.first_name)}
              {renderField('Nom', 'last_name', repair.last_name)}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField('Adresse', 'address', repair.address)}
              {renderField('Téléphone', 'phone', repair.phone)}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField('Email', 'email', repair.email)}
            </Grid>
            <Grid item xs={12} display={'flex'} flexDirection={'column'}>
              <img
                src={repair.signatureUrl}
                srcSet={repair.signatureUrl}
                alt={'Signature client'}
                loading="lazy"
                width={150}
              />
              <Typography variant="caption" gutterBottom>
                Signature client
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Information techniques</Typography>
                <IconButton
                  onClick={() =>
                    toggleEditableSection('technicalInfo', [
                      'file_url',
                      'bucket_name',
                      'working_time',
                      'replaced_part_list',
                      'repairer_name',
                      'state',
                      'replaced_part_list',
                    ])
                  }
                >
                  {editableSections['technicalInfo'] ? (
                    <SaveIcon />
                  ) : (
                    <EditIcon />
                  )}
                </IconButton>
              </Box>
            </Grid>
            {renderTimePicker()}
            {renderSelect(
              'État',
              'state',
              repair.state || 'Non commencé',
              ['Non commencé', 'En cours', 'Terminé', 'Hors service'],
              colorByState,
            )}
            {renderSelect(
              'Réparateur',
              'repairer_name',
              repair.repairer_name || 'Non attribué',
              repairers,
            )}
            {renderMultiSelect(
              'Pièces remplacées',
              'replaced_part_list',
              repair.replaced_part_list || [],
              replacedParts,
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Photos
            </Typography>
            {repair.imageUrls?.length > 0 ? (
              <ImageList variant="masonry" cols={2} gap={8}>
                {repair.imageUrls.map((url: string) => (
                  <ImageListItem
                    key={url}
                    onClick={() => handleImageClick(url)}
                    sx={{ cursor: 'zoom-in' }}
                  >
                    <img
                      src={`${url}`}
                      srcSet={`${url}`}
                      alt={'Repair Image'}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Typography>Pas de photo disponible</Typography>
            )}
          </Grid>
          <Modal open={openModal} onClose={handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
              }}
            >
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected Repair"
                  style={{ width: '100%' }}
                />
              )}
            </Box>
          </Modal>
        </Grid>
      )}
    </Box>
  );
};

export default SingleRepair;
