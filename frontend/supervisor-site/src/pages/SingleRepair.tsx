import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import {
  AttachEmail as AttachEmailIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  deleteRepair,
  fetchBrands,
  fetchRepairById,
  fetchRepairers,
  fetchReplacedParts,
  sendEmailApi,
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
import RepairField from '../components/repair/RepairField';
import ReactPDF from '@react-pdf/renderer';
import MyDocument from '../components/repair/Document';

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
  replaced_part_list: { name: string; price: number }[];
  state: string | null;
  createdAt: string;
  imageUrls: string[];
  signatureUrl: string;
  brand_name: string;
  warranty?: boolean;
  repairer_name: string | null;
  remark: string | null;
}

export const replacedPartToString = (replacedPart: {
  name: string;
  price: number;
}) => {
  return `${replacedPart.name} - ${replacedPart.price}€`;
};

const getPdfDocumentProps = (repair: MachineRepair) => {
  return (
    <MyDocument
      dateDuDepot={repair.createdAt}
      gSMClient={repair.phone}
      nom={`${repair.first_name} ${repair.last_name}`}
      code={repair.id.toString()}
      type={repair.machine_type}
      codeRobot={repair.robot_code}
      modele={repair.brand_name}
      typeReparation={repair.repair_or_maintenance}
      avecGarantie={repair.warranty ? 'Oui' : 'Non'}
      remarques={repair.fault_description}
      prix={
        repair.replaced_part_list
          .reduce((acc, part) => acc + part.price, 0)
          .toString() + '€'
      }
      tempsPasse={`${repair.working_time_hour ?? 0}h ${repair.working_time_minute ?? 0}m`}
      piecesRemplacees={repair.replaced_part_list
        .map(replacedPartToString)
        .join(', ')}
      travailEffectue={repair.remark ?? ''}
    />
  );
};

const SingleRepair = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<null | MachineRepair>(null);
  const [initialRepair, setInitialRepair] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingSendEmail, setIsLoadingSendEmail] = useState(false);
  const [editableFields, setEditableFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [editableSections, setEditableSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replacedParts, setReplacedParts] = useState<
    { name: string; price: number }[]
  >([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [repairers, setRepairers] = useState<string[]>([]);
  const [instance, updateInstance] = ReactPDF.usePDF({
    document: undefined,
  });

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

    const fetchBrandsData = async () => {
      try {
        const brands = await fetchBrands(auth.token);
        setBrands(brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        alert(
          `Une erreur s'est produite lors de la récupération des données ${error}`,
        );
      }
    };

    fetchBrandsData();
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

  useEffect(() => {
    if (repair) {
      updateInstance(getPdfDocumentProps(repair));
    }
  }, [repair]);

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

  const handleReplacedPartSelectChange = (
    event: SelectChangeEvent<String[]>,
  ) => {
    const newReplacedParts = Array.isArray(event.target.value)
      ? event.target.value.map((partName) => {
          const part = replacedParts.find((p) => p.name === partName);
          if (!part) {
            toast.error(`Pièce ${partName} non trouvée`);
            throw new Error(`Pièce ${partName} non trouvée`);
          }
          return part;
        })
      : [];

    setRepair({
      ...repair,
      [event.target.name]: newReplacedParts,
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

  const toggleEditableSection = (section: string, fields: string[]) => {
    const isSectionEditable = !editableSections[section];
    setEditableSections({ ...editableSections, [section]: isSectionEditable });
    fields.forEach((field) => {
      setEditableFields((prev) => ({ ...prev, [field]: isSectionEditable }));
    });
    const hasChanges = JSON.stringify(repair) !== JSON.stringify(initialRepair);
    if (hasChanges && !isSectionEditable) {
      // save action
      handleUpdate();
    }
  };

  const closeAllEditableSections = () => {
    setEditableSections({});
    setEditableFields({});
  };

  const handleDelete = async () => {
    if (!repair || !id) {
      console.error('No repair data or id found');
      return;
    }

    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible',
    );

    if (!confirmDelete) {
      return;
    }

    setLoading(true);

    try {
      await deleteRepair(auth.token, id);
      // redirect to home
      navigate('/');
    } catch (error) {
      console.error('Error deleting repair:', error);
      toast.error(
        "Une erreur s'est produite lors de la suppression de la réparation",
      );
    } finally {
      setLoading(false);
    }
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

  const sendEmail = async () => {
    setIsLoadingSendEmail(true);
    try {
      // send pdf to email api
      const pdfBlob = instance.blob;
      if (!pdfBlob) {
        console.error('No pdf blob found');
        toast.error("Une erreur s'est produite lors de la création du PDF");
        return;
      }
      const formData = new FormData();
      formData.append('attachment', pdfBlob, `fiche_reparation_${id}.pdf`);
      await sendEmailApi(auth.token, id!, formData);
      toast.success('Email envoyé avec succès');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Une erreur s'est produite lors de l'envoi de l'email");
    } finally {
      setIsLoadingSendEmail(false);
    }
  };

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
    <RepairField
      label={label}
      name={name}
      value={value}
      isMultiline={isMultiline}
      editableFields={editableFields}
      handleChange={handleChange}
    />
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
    sxFormControl: SxProps<Theme>,
    gridSize: 6 | 12,
    colorByValue: { [p: string]: string } = {},
  ) => {
    return (
      <Grid item xs={gridSize}>
        {editableFields[name] ? (
          <FormControl sx={sxFormControl}>
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

  const renderReplacedPartSelect = (
    label: string,
    name: string,
    values: { name: string; price: number }[],
    possibleValues: { name: string; price: number }[],
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
              value={values.map((val) => val.name)}
              name={name}
              onChange={handleReplacedPartSelectChange}
              input={<OutlinedInput id="select-multiple-chip" label={label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {possibleValues.map((val) => {
                const replacedPartString = replacedPartToString(val);
                return (
                  <MenuItem key={val.name} value={val.name}>
                    <Checkbox
                      checked={values.some((v) => v.name === val.name)}
                    />
                    <ListItemText primary={replacedPartString} />
                  </MenuItem>
                );
              })}
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
              {values.length
                ? values.map(replacedPartToString).join(', ')
                : 'Aucune'}
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
        <Grid
          item
          xs={6}
          display={'flex'}
          flexDirection={'row-reverse'}
          gap={4}
        >
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
          <Button
            color="secondary"
            startIcon={<AttachEmailIcon />}
            onClick={sendEmail}
            disabled={isLoadingSendEmail}
          >
            {isLoadingSendEmail ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Envoyer par email'
            )}
          </Button>
          <Button
            color="primary"
            startIcon={<FileDownloadIcon />}
            component="a"
            href={instance.url ?? undefined}
            download={`fiche_reparation_${id}.pdf`}
          >
            Télécharger
          </Button>
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
                      'brand_name',
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
              {renderSelect(
                'Marque',
                'brand_name',
                repair.brand_name,
                brands,
                { width: '100%', margin: '5px 0' },
                6,
              )}
              {renderField(
                'Code du robot',
                'robot_code',
                repair.robot_code || '',
              )}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderCheckbox('Garantie', 'warranty', repair.warranty ?? false)}
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
                      'remark',
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
              { marginTop: 2, marginBottom: 1, width: '80%' },
              12,
              colorByState,
            )}
            {renderSelect(
              'Réparateur',
              'repairer_name',
              repair.repairer_name || 'Non attribué',
              repairers,
              { marginTop: 2, marginBottom: 1, width: '80%' },
              12,
            )}
            <Box width={'80%'}>
              {renderField(
                'Remarques atelier',
                'remark',
                repair.remark ?? '',
                true,
              )}
            </Box>
            <Box margin={'20px 0'}>
              {renderReplacedPartSelect(
                'Pièces remplacées',
                'replaced_part_list',
                repair.replaced_part_list || [],
                replacedParts,
              )}
              <Box display={'flex'} gap={'10px'} margin={'5px 0'}>
                <Typography variant="subtitle1">Total pièces :</Typography>
                <Typography variant="subtitle1">
                  {repair.replaced_part_list.reduce(
                    (acc, part) => acc + part.price,
                    0,
                  )}
                  €
                </Typography>
              </Box>
            </Box>
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
