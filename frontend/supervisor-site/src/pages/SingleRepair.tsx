import React, {
  EventHandler,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
  List,
  ListItem,
  ListItemIcon,
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
  AddToDrive as AddToDriveIcon,
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
  fetchAllConfig,
  fetchRepairById,
  sendDriveApi,
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

type ReplacedPart = { name: string; price: number };

interface MachineRepair {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  email: string;
  machine_type_name: string;
  repair_or_maintenance: string;
  robot_code: string;
  fault_description: string;
  start_timer: Date | null;
  working_time_in_sec: number;
  replaced_part_list: {
    quantity: number;
    replacedPart: ReplacedPart;
  }[];
  state: string | null;
  createdAt: string;
  imageUrls: string[];
  signatureUrl: string;
  brand_name: string;
  warranty?: boolean;
  devis: boolean;
  repairer_name: string | null;
  remark: string | null;
  city: string | null;
  postal_code: string | null;
}

export const replacedPartToString = (
  replacedPart: MachineRepair['replaced_part_list'][0],
) => {
  return `${replacedPart.quantity}x ${replacedPart.replacedPart.name} (${replacedPart.replacedPart.price}€)`;
};

export const possibleReplacedPartToString = (replacedPart: {
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

function formatPrice(value: number) {
  return `${value.toFixed(2).replace('.', ',')}€`;
}

function getWorkingTimePrice(repair: MachineRepair, hourlyRate: number) {
  const price = repair.working_time_in_sec * (hourlyRate / 3600);
  return formatPrice(price);
}

function getTotalPriceParts(repair: MachineRepair) {
  const total = repair.replaced_part_list.reduce(
    (acc, replacedPart) =>
      acc + replacedPart.replacedPart.price * replacedPart.quantity,
    0,
  );
  return formatPrice(total);
}

function getTotalPrice(repair: MachineRepair, hourlyRate: number) {
  const partsTotal = repair.replaced_part_list.reduce(
    (acc, replacedPart) =>
      acc + replacedPart.replacedPart.price * replacedPart.quantity,
    0,
  );
  const workingTimePrice = repair.working_time_in_sec * (hourlyRate / 3600);
  return formatPrice(partsTotal + workingTimePrice);
}

function getSuffixPriceDevis(repair: MachineRepair, priceDevis: number) {
  return repair.devis ? ` +${String(priceDevis).replace('.', ',')}€` : '';
}

const getPdfDocumentProps = (
  repair: MachineRepair,
  hourlyRate: number,
  priceDevis: number,
  conditions: string,
  address: string,
  phone: string,
  email: string,
  website: string,
  pdfTitle: string,
) => {
  return (
    <MyDocument
      dateDuDepot={new Date(repair.createdAt).toLocaleDateString('fr-FR')}
      gSMClient={repair.phone}
      nom={`${repair.first_name} ${repair.last_name}`}
      code={repair.id.toString()}
      type={repair.machine_type_name}
      codeRobot={repair.robot_code}
      modele={repair.brand_name}
      typeReparation={repair.repair_or_maintenance}
      avecGarantie={repair.warranty ? 'Oui' : 'Non'}
      remarques={repair.fault_description}
      prix={getWorkingTimePrice(repair, hourlyRate)}
      tempsPasse={getFormattedWorkingTime(repair.working_time_in_sec, false)}
      piecesRemplacees={
        repair.replaced_part_list.map(replacedPartToString).join(', ') ||
        'Aucune'
      }
      travailEffectue={repair.remark ?? ''}
      avecDevis={
        repair.devis ? `Oui${getSuffixPriceDevis(repair, priceDevis)}` : 'Non'
      }
      prixPieces={getTotalPriceParts(repair)}
      prixTotal={getTotalPrice(repair, hourlyRate)}
      conditions={conditions}
      address={address}
      phone={phone}
      email={email}
      website={website}
      pdfTitle={pdfTitle}
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
  const [isLoadingAddDrive, setIsLoadingAddDrive] = useState(false);
  const [editableFields, setEditableFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [editableSections, setEditableSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [possibleReplacedParts, setPossibleReplacedParts] = useState<
    ReplacedPart[]
  >([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [repairers, setRepairers] = useState<string[]>([]);
  const [instance, updateInstance] = ReactPDF.usePDF({
    document: undefined,
  });
  const [hourlyRate, setHourlyRate] = useState(0);
  const [priceDevis, setPriceDevis] = useState(0);
  const [machineTypes, setMachineTypes] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string>('');
  const [adresse, setAdresse] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [siteWeb, setSiteWeb] = useState<string>('');
  const [titreBonPdf, setTitreBonPdf] = useState<string>('');

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  useEffect(() => {
    const fetchAllConfigData = async () => {
      try {
        const {
          brands,
          repairerNames,
          replacedParts,
          config: {
            'Taux horaire': hourlyRate,
            'Prix devis': priceDevis,
            'Conditions générales de réparation': conditions,
            Adresse: address,
            Téléphone: phone,
            Email: email,
            'Site web': website,
            'Titre bon pdf': pdfTitle,
          },
          machineType,
        } = await fetchAllConfig(auth.token);
        setBrands(brands);
        setRepairers(repairerNames);
        setPossibleReplacedParts(replacedParts);
        setHourlyRate(Number(hourlyRate));
        setPriceDevis(Number(priceDevis));
        setMachineTypes(machineType);
        setConditions(conditions);
        setAdresse(address);
        setTelephone(phone);
        setEmail(email);
        setSiteWeb(website);
        setTitreBonPdf(pdfTitle);
      } catch (error) {
        console.error('Error fetching config:', error);
        alert(
          `Une erreur s'est produite lors de la récupération des données ${error}`,
        );
      }
    };

    fetchAllConfigData();
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
      updateInstance(
        getPdfDocumentProps(
          repair,
          hourlyRate,
          priceDevis,
          conditions,
          adresse,
          telephone,
          email,
          siteWeb,
          titreBonPdf,
        ),
      );
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
      handleUpdate(repair, initialRepair); // update the start_timer field in the backend
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
          const part = possibleReplacedParts.find((p) => p.name === partName);
          if (!part) {
            toast.error(`Pièce ${partName} non trouvée`);
            throw new Error(`Pièce ${partName} non trouvée`);
          }
          return {
            quantity:
              repair?.replaced_part_list.find(
                (p) => p.replacedPart.name === partName,
              )?.quantity || 1,
            replacedPart: part,
          };
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

  const handleDeleteReplacedPart = useCallback(
    (replacedPartName: string) => {
      if (!repair || !initialRepair) {
        console.error('No repair data found');
        return;
      }
      const newReplacedPartList = repair.replaced_part_list.filter(
        (part) => part.replacedPart.name !== replacedPartName,
      );
      const newRepair = {
        ...repair,
        replaced_part_list: newReplacedPartList,
      };
      setRepair(newRepair);
      handleUpdate(newRepair, initialRepair);
    },
    [repair, initialRepair],
  );

  const updateQuantityOfReplacedPart = useCallback(
    (
      e: SelectChangeEvent<number>,
      replacedPart: MachineRepair['replaced_part_list'][0],
    ) => {
      if (!repair || !initialRepair) {
        console.error('No repair data found');
        return;
      }
      const newReplacedPartList = repair.replaced_part_list.map((part) => {
        if (part.replacedPart.name === replacedPart.replacedPart.name) {
          return {
            ...part,
            quantity: Number(e.target.value),
          };
        }
        return part;
      });
      const newRepair = {
        ...repair,
        replaced_part_list: newReplacedPartList,
      };
      setRepair(newRepair);
      handleUpdate(newRepair, initialRepair);
    },
    [repair, initialRepair],
  );

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
        handleUpdate(repair, initialRepair);
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
      handleUpdate(repair!, initialRepair!);
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

  const handleUpdate = async (
    repairData: MachineRepair,
    initialRepairData: MachineRepair,
  ) => {
    setLoading(true);

    const updatedData: Record<keyof MachineRepair, any> = getKeys(
      repairData,
    ).reduce((acc: any, key: keyof MachineRepair) => {
      if (repairData[key] !== initialRepairData[key]) {
        acc[key] = repairData[key];
      }
      return acc;
    }, {});

    try {
      await updateRepair(auth.token, id!, updatedData);
      toast.success('Fiche mise à jour avec succès', {
        toastId: 'successUpdateSingleRepair',
        updateId: 'successUpdateSingleRepair',
      });
      setInitialRepair(repairData);
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

  const sendDrive = async () => {
    if (isRunning) {
      toast.warn(
        "Arrêtez le chronomètre avant d'ajouter le PDF à Google Drive",
      );
      return;
    }

    setIsLoadingAddDrive(true);
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
      await sendDriveApi(auth.token, id!, formData);
      toast.success('PDF ajouté au Google Drive avec succès');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(
        "Une erreur s'est produite lors de l'ajout du PDF à Google Drive",
      );
    } finally {
      setIsLoadingAddDrive(false);
    }
  };

  const renderCheckbox = (
    label: string,
    name: string,
    value: boolean,
    suffix = '',
  ) => (
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
          <Typography variant="subtitle1">
            {value ? 'Oui' : 'Non'}
            {suffix}
          </Typography>
        </Box>
      )}
    </Grid>
  );

  const renderField = (
    label: string,
    name: string,
    value: string,
    isMultiline: boolean = false,
    xs?: 6 | 12 | 3,
  ) => (
    <RepairField
      label={label}
      name={name}
      value={value}
      isMultiline={isMultiline}
      editableFields={editableFields}
      handleChange={handleChange}
      xs={xs}
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
          marginTop={'10px'}
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
                    {hours + days * 24}h {minutes}m {seconds}s
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
    values: MachineRepair['replaced_part_list'],
    possibleValues: ReplacedPart[],
  ) => {
    return (
      <Grid item xs={12}>
        {editableFields[name] && (
          <FormControl sx={{ marginTop: 2, marginBottom: 1, width: '80%' }}>
            <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              value={values.map((val) => val.replacedPart.name)}
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
                const replacedPartString = possibleReplacedPartToString(val);
                return (
                  <MenuItem key={val.name} value={val.name}>
                    <Checkbox
                      checked={values.some(
                        (v) => v.replacedPart.name === val.name,
                      )}
                    />
                    <ListItemText primary={replacedPartString} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
        <Box
          display={'flex'}
          flexDirection={values.length ? 'column' : 'row'}
          gap={values.length ? undefined : '10px'}
          margin={'5px 0'}
        >
          <Typography variant="subtitle1">{label} :</Typography>
          <Grid item xs={6}>
            {values.length ? (
              <List sx={{ width: '100%' }}>
                {values.map((replacedPart) => (
                  <ListItem
                    key={replacedPart.replacedPart.name}
                    secondaryAction={
                      <Select
                        sx={{ width: 70 }}
                        size={'small'}
                        value={replacedPart.quantity}
                        onChange={(e) =>
                          updateQuantityOfReplacedPart(e, replacedPart)
                        }
                      >
                        {[...Array(10).keys()].map((num) => (
                          <MenuItem key={num} value={num + 1}>
                            {num + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    }
                  >
                    <ListItemIcon>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() =>
                          handleDeleteReplacedPart(
                            replacedPart.replacedPart.name,
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${replacedPart.replacedPart.name} - ${replacedPart.replacedPart.price}€`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="subtitle1">Aucune</Typography>
            )}
          </Grid>
        </Box>
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 4, paddingTop: 2 }}>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            // backgroundColor: 'rgba(255, 255, 255, 0.4)',
            background: 'transparent',
            zIndex: 100,
            width: '100vw',
            top: 0,
            right: 0,
          }}
        >
          <CircularProgress size={'4rem'} />
        </Box>
      )}
      <Grid container display={'flex'}>
        <Grid item xs={3}>
          <Typography variant="h4" gutterBottom paddingTop={1}>
            Fiche n°{id}
          </Typography>
        </Grid>
        <Grid
          item
          xs={9}
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
            startIcon={<AddToDriveIcon />}
            onClick={sendDrive}
            disabled={isLoadingAddDrive}
          >
            {isLoadingAddDrive ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sauvegarder dans le Google Drive'
            )}
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
                      'machine_type_name',
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
              {renderSelect(
                'Type de machine',
                'machine_type_name',
                repair.machine_type_name,
                machineTypes,
                { width: '100%', margin: '5px 0' },
                6,
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
              {renderCheckbox(
                'Devis',
                'devis',
                repair.devis,
                getSuffixPriceDevis(repair, priceDevis),
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
            <Grid item xs={12} padding={'20px 0'}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Informations techniques</Typography>
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
            {renderTimePicker()}
            <Box display={'flex'} gap={'10px'} marginBottom={'20px'}>
              <Typography variant="subtitle1">Total temps:</Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {getWorkingTimePrice(repair, hourlyRate)}
              </Typography>
            </Box>
            <Box margin={'20px 0'}>
              {renderReplacedPartSelect(
                'Pièces remplacées',
                'replaced_part_list',
                repair.replaced_part_list || [],
                possibleReplacedParts,
              )}
              <Box display={'flex'} gap={'10px'} margin={'5px 0'}>
                <Typography variant="subtitle1">Total pièces :</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getTotalPriceParts(repair)}
                </Typography>
              </Box>
            </Box>
            <Box display={'flex'} gap={'10px'} margin={'5px 0'}>
              <Typography variant="subtitle1" fontWeight="bold">
                Total :
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {getTotalPrice(repair, hourlyRate)}
              </Typography>
            </Box>
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
                      'city',
                      'postal_code',
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
              {renderField('Adresse', 'address', repair.address, false, 12)}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField(
                'Code postal',
                'postal_code',
                repair.postal_code ?? '',
              )}
              {renderField('Ville', 'city', repair.city ?? '')}
            </Grid>
            <Grid item xs={12} display={'flex'} gap={'10px'}>
              {renderField('Email', 'email', repair.email)}
              {renderField('Téléphone', 'phone', repair.phone)}
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
            <Grid item xs={12} padding={'20px 0'}>
              <Divider />
            </Grid>
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
