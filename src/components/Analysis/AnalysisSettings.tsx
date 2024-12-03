import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Typography,
  TextField,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import type { UserSettings } from '../../types/user';
import type { AnalysisPreferences } from '../../types/analysis';

interface AnalysisSettingsProps {
  settings: UserSettings | null;
  onSettingsChange: (settings: UserSettings) => void;
}

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  if (!settings) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1">Loading settings...</Typography>
        </CardContent>
      </Card>
    );
  }

  const handleBooleanChange = (field: keyof AnalysisPreferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSettingsChange({
      ...settings,
      analysisPreferences: {
        ...settings.analysisPreferences,
        [field]: event.target.checked,
      },
    });
  };

  const handleNumberChange = (field: keyof AnalysisPreferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    onSettingsChange({
      ...settings,
      analysisPreferences: {
        ...settings.analysisPreferences,
        [field]: field === 'confidenceThreshold' 
          ? parseFloat(value) 
          : parseInt(value, 10),
      },
    });
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    onSettingsChange({
      ...settings,
      analysisPreferences: {
        ...settings.analysisPreferences,
        preferredModel: event.target.value,
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analysis Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.analysisPreferences.autoProcess}
                onChange={handleBooleanChange('autoProcess')}
              />
            }
            label="Auto-process images"
          />
          <Typography variant="body2" color="text.secondary">
            Automatically process images when they are uploaded
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.analysisPreferences.saveOriginalImages}
                onChange={handleBooleanChange('saveOriginalImages')}
              />
            }
            label="Save original images"
          />
          <Typography variant="body2" color="text.secondary">
            Keep the original images after processing
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.analysisPreferences.notificationsEnabled}
                onChange={handleBooleanChange('notificationsEnabled')}
              />
            }
            label="Enable notifications"
          />
          <Typography variant="body2" color="text.secondary">
            Send notifications when analysis is complete
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Preferred Model</InputLabel>
            <Select
              value={settings.analysisPreferences.preferredModel}
              onChange={handleModelChange}
              label="Preferred Model"
            >
              <MenuItem value="trashnet">TrashNet</MenuItem>
              <MenuItem value="taco">TACO</MenuItem>
              <MenuItem value="wastenet">WasteNet</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Confidence Threshold"
            type="number"
            value={settings.analysisPreferences.confidenceThreshold}
            onChange={handleNumberChange('confidenceThreshold')}
            inputProps={{
              min: 0,
              max: 1,
              step: 0.1,
            }}
            helperText="Minimum confidence level required for classification (0-1)"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Max Storage Size (MB)"
            type="number"
            value={settings.analysisPreferences.maxStorageSize}
            onChange={handleNumberChange('maxStorageSize')}
            inputProps={{
              min: 1,
              step: 1,
            }}
            helperText="Maximum storage size for analysis images"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Compression Quality"
            type="number"
            value={settings.analysisPreferences.compressionQuality}
            onChange={handleNumberChange('compressionQuality')}
            inputProps={{
              min: 0,
              max: 100,
              step: 1,
            }}
            helperText="Image compression quality (0-100)"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalysisSettings;
