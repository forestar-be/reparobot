import React from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

interface ReplacedPart {
  name: string;
  price: number;
}

interface MachineRepair {
  replaced_part_list: {
    quantity: number;
    replacedPart: ReplacedPart;
  }[];
}

interface ReplacedPartSelectProps {
  label: string;
  name: string;
  values: MachineRepair['replaced_part_list'];
  possibleValues: ReplacedPart[];
  editableFields: { [key: string]: boolean };
  handleReplacedPartSelectChange: (event: SelectChangeEvent<string[]>) => void;
  updateQuantityOfReplacedPart: (
    e: SelectChangeEvent<unknown>,
    replacedPart: MachineRepair['replaced_part_list'][0],
  ) => void;
  handleDeleteReplacedPart: (replacedPartName: string) => void;
  possibleReplacedPartToString: (part: ReplacedPart) => string;
}

const ReplacedPartSelect: React.FC<ReplacedPartSelectProps> = ({
  label,
  name,
  values,
  possibleValues,
  editableFields,
  handleReplacedPartSelectChange,
  updateQuantityOfReplacedPart,
  handleDeleteReplacedPart,
  possibleReplacedPartToString,
}) => {
  return (
    <Grid item xs={12}>
      {editableFields[name] && (
        <FormControl sx={{ marginTop: 2, marginBottom: 1, width: '80%' }}>
          <InputLabel id={`multiple-chip-label-${name}`}>{label}</InputLabel>
          <Select
            labelId={`multiple-chip-label-${name}`}
            id={`multiple-chip-${name}`}
            multiple
            value={values.map((val) => val.replacedPart.name)}
            name={name}
            onChange={handleReplacedPartSelectChange}
            input={
              <OutlinedInput
                id={`select-multiple-chip-${name}`}
                label={label}
              />
            }
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

export default ReplacedPartSelect;