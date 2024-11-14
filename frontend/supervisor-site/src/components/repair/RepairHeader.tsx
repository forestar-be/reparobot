import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import { Button, CircularProgress, Grid, Typography } from '@mui/material';
import {
  AddToDrive as AddToDriveIcon,
  AttachEmail as AttachEmailIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

interface RepairHeaderProps {
  id: string | undefined;
  onClick: () => Promise<void>;
  onClick1: () => Promise<void>;
  disabled: boolean;
  onClick2: () => Promise<void>;
  disabled1: boolean;
  instance: ReactPDF.UsePDFInstance;
  onClick3: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const RepairHeader = (props: RepairHeaderProps) => (
  <Grid container display={'flex'}>
    <Grid item xs={3}>
      <Typography variant="h4" gutterBottom paddingTop={1}>
        Fiche n°{props.id}
      </Typography>
    </Grid>
    <Grid item xs={9} display={'flex'} flexDirection={'row-reverse'} gap={4}>
      <Button color="error" startIcon={<DeleteIcon />} onClick={props.onClick}>
        Supprimer
      </Button>
      <Button
        color="secondary"
        startIcon={<AddToDriveIcon />}
        onClick={props.onClick1}
        disabled={
          props.disabled || props.instance.loading || !props.instance.blob
        }
      >
        {props.disabled ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sauvegarder dans le Google Drive'
        )}
      </Button>
      <Button
        color="secondary"
        startIcon={<AttachEmailIcon />}
        onClick={props.onClick2}
        disabled={
          props.disabled1 || props.instance.loading || !props.instance.blob
        }
      >
        {props.disabled1 ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Envoyer par email au client'
        )}
      </Button>
      <Button
        color="primary"
        startIcon={<FileDownloadIcon />}
        component="a"
        href={props.instance.url ?? undefined}
        download={`fiche_reparation_${props.id}.pdf`}
        onClick={props.onClick3}
        disabled={props.instance.loading || !props.instance.url}
      >
        Télécharger
      </Button>
    </Grid>
  </Grid>
);
