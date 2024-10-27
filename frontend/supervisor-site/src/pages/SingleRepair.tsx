import React, { EventHandler, MouseEvent, useEffect, useState } from 'react';
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
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Replay as ReplayIcon,
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
import { useStopwatch } from 'react-timer-hook';

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
  start_timer: Date | null;
  working_time_in_sec: number;
  replaced_part_list: { name: string; price: number }[];
  state: string | null;
  createdAt: string;
  imageUrls: string[];
  signatureUrl: string;
  brand_name: string;
  warranty?: boolean;
  devis: boolean;
  repairer_name: string | null;
  remark: string | null;
}

export const replacedPartToString = (replacedPart: {
  name: string;
  price: number;
}) => {
  return `${replacedPart.name} - ${replacedPart.price}€`;
};

const getHoursMinutesAndSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return { hours, minutes, remainingSeconds };
};

export const getFormattedWorkingTime = (
  seconds: number,
  withSeconds = false,
) => {
  const { hours, minutes, remainingSeconds } =
    getHoursMinutesAndSeconds(seconds);
  return `${hours}h ${minutes}m ${withSeconds ? `${remainingSeconds}s` : ''}`;
};

const getPdfDocumentProps = (repair: MachineRepair) => {
  return (
    <MyDocument
      dateDuDepot={new Date(repair.createdAt).toLocaleDateString('fr-FR')}
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
      tempsPasse={getFormattedWorkingTime(repair.working_time_in_sec, false)}
      piecesRemplacees={repair.replaced_part_list
        .map(replacedPartToString)
        .join(', ')}
      travailEffectue={repair.remark ?? ''}
      avecDevis={repair.devis ? 'Oui' : 'Non'}
    />
  );
};

const SingleRepair = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<null | MachineRepair>(null);
  const [initialRepair, setInitialRepair] = useState<null | MachineRepair>(
    null,
  );
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
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

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
        const repairData: { start_timer: string | null } & MachineRepair =
          await fetchRepairById(id, auth.token);
        const repairDataWithDate = {
          ...repairData,
          start_timer: repairData.start_timer
            ? new Date(repairData.start_timer)
            : null,
        };
        setInitialRepair(repairDataWithDate);
        setRepair(repairDataWithDate);
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

  useEffect(() => {
    if (!repair || !initialRepair) {
      return;
    }

    if (repair.start_timer) {
      const currentOffset = repair.working_time_in_sec * 1000;
      const startTime = repair.start_timer.getTime();
      console.log('Restarting timer', {
        currentOffset,
        startTime,
      });

      const currentTime = new Date().getTime();
      const offsetTimestamp = new Date(
        currentTime + (currentTime - startTime + currentOffset),
      );
      console.log('Offset timestamp', offsetTimestamp);
      reset(offsetTimestamp, true);
    } else {
      console.log('Pausing timer');
      pause();
    }

    if (repair.start_timer !== initialRepair.start_timer) {
      handleUpdate(); // update the start_timer field in the backend
    }
  }, [repair?.start_timer]);

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

  const handleManualTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(String(e.target.value).replace(/\D/g, ''));
    if (!isNaN(value) && repair) {
      const name = e.target.name as 'hour' | 'minute' | 'second';
      let newTime = repair.working_time_in_sec;
      if (name === 'hour') {
        newTime = value * 3600 + (repair.working_time_in_sec % 3600);
      } else if (name === 'minute') {
        newTime =
          Math.floor(repair.working_time_in_sec / 3600) * 3600 +
          value * 60 +
          (repair.working_time_in_sec % 60);
      } else if (name === 'second') {
        newTime = Math.floor(repair.working_time_in_sec / 60) * 60 + value;
      }
      setRepair({
        ...repair,
        working_time_in_sec: newTime,
      });
    }
  };

  const startTimer = () => {
    if (repair) {
      setRepair({
        ...repair,
        start_timer: new Date(),
      });
    }
  };

  const stopTimer = () => {
    if (repair) {
      console.log('stopping timer', totalSeconds);
      setRepair({
        ...repair,
        working_time_in_sec: totalSeconds,
        start_timer: null,
      });
    }
  };

  const resetTimer = () => {
    if (repair) {
      console.log('resetting timer');
      setRepair({
        ...repair,
        working_time_in_sec: 0,
        start_timer: null,
      });
    }
  };

  useEffect(() => {
    if (repair && initialRepair) {
      if (
        !isRunning &&
        !editableSections['technicalInfo'] && // only update if not in edit mode and timer is not running
        repair.working_time_in_sec !== initialRepair.working_time_in_sec &&
        repair.start_timer === initialRepair.start_timer // skip when start_timer is updated as update already triggered by useEffect of start_timer
      ) {
        console.log('Updating repair working time', {
          repair,
          initialRepair,
        });
        handleUpdate();
      }
    }
  }, [repair?.working_time_in_sec]);

  const toggleEditableSection = (section: string, fields: string[]) => {
    const isSectionEditable = !editableSections[section];
    setEditableSections({ ...editableSections, [section]: isSectionEditable });
    fields.forEach((field) => {
      setEditableFields((prev) => ({ ...prev, [field]: isSectionEditable }));
    });
    const hasChanges = JSON.stringify(repair) !== JSON.stringify(initialRepair);
    if (hasChanges && !isSectionEditable) {
      console.log('Changes detected, updating repair', {
        repair,
        initialRepair,
      });
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
    if (!repair || !initialRepair) {
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
    if (isRunning) {
      toast.warn("Arrêtez le chronomètre avant d'envoyer l'email");
      return;
    }

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
      <Grid item xs={12}>
        <Box
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          gap={'10px'}
          margin={'5px 0'}
        >
          <Typography
            variant="subtitle1"
            noWrap
            // width={editableFields['working_time'] ? 180 : undefined}
          >
            Temps passé :
          </Typography>
          {editableFields['working_time'] && !isRunning ? (
            <>
              <TextField
                label={'Heure'}
                name={'hour'}
                value={Math.floor(repair.working_time_in_sec / 3600)}
                onChange={handleManualTimeChange}
              ></TextField>
              <TextField
                label={'Minute'}
                name={'minute'}
                value={Math.floor((repair.working_time_in_sec % 3600) / 60)}
                onChange={handleManualTimeChange}
              ></TextField>
              <TextField
                label={'Second'}
                name={'second'}
                value={repair.working_time_in_sec % 60}
                onChange={handleManualTimeChange}
              ></TextField>
            </>
          ) : (
            <>
              <Typography variant="subtitle1" noWrap width={100}>
                {isRunning ? (
                  <>
                    {hours}h {minutes}m {seconds}s
                  </>
                ) : (
                  <>
                    {getFormattedWorkingTime(repair.working_time_in_sec, true)}
                  </>
                )}
              </Typography>
              <Button
                size={'small'}
                variant="contained"
                color="primary"
                startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
                onClick={isRunning ? stopTimer : startTimer}
              >
                {isRunning ? 'Arrêter' : 'Démarrer'}
              </Button>
              {!isRunning && (
                <Button
                  size={'small'}
                  variant="contained"
                  color="secondary"
                  startIcon={<ReplayIcon />}
                  onClick={resetTimer}
                >
                  Réinitialiser
                </Button>
              )}
            </>
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
              'Envoyer par email au client'
            )}
          </Button>
          <Button
            color="primary"
            startIcon={<FileDownloadIcon />}
            component="a"
            href={instance.url ?? undefined}
            download={`fiche_reparation_${id}.pdf`}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (isRunning) {
                e.preventDefault();
                toast.warn(
                  'Arrêtez le chronomètre avant de télécharger le PDF',
                );
              }
            }}
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
                      'devis',
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
              {renderCheckbox('Devis', 'devis', repair.devis)}
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
              Object.keys(colorByState),
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
