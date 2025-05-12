import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

export interface PromptSettings {
  tone: 'professional' | 'casual' | 'enthusiastic' | 'formal';
  length: 'concise' | 'moderate' | 'detailed';
  enthusiasm: number; // 0-100
  personalization: number; // 0-100
  formality: number; // 0-100
  customInstructions: string;
  keyPoints: string[];
  callToAction: 'direct' | 'soft' | 'none';
}

interface CampaignPromptCustomizerProps {
  settings: PromptSettings;
  onChange: (settings: PromptSettings) => void;
}

const CampaignPromptCustomizer: React.FC<CampaignPromptCustomizerProps> = ({
  settings,
  onChange,
}) => {
  const { t } = useTranslation();
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const handleSliderChange =
    (field: keyof PromptSettings) => (_: Event, value: number | number[]) => {
      onChange({ ...settings, [field]: value });
    };

  const handleToneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...settings,
      tone: event.target.value as PromptSettings['tone'],
    });
  };

  const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...settings,
      length: event.target.value as PromptSettings['length'],
    });
  };

  const handleCallToActionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...settings,
      callToAction: event.target.value as PromptSettings['callToAction'],
    });
  };

  const handleCustomInstructionsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...settings, customInstructions: event.target.value });
  };

  const handleAddKeyPoint = () => {
    if (
      newKeyPoint.trim() &&
      !settings.keyPoints.includes(newKeyPoint.trim())
    ) {
      onChange({
        ...settings,
        keyPoints: [...settings.keyPoints, newKeyPoint.trim()],
      });
      setNewKeyPoint('');
    }
  };

  const handleRemoveKeyPoint = (point: string) => {
    onChange({
      ...settings,
      keyPoints: settings.keyPoints.filter((p) => p !== point),
    });
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="prompt-customizer-content"
        id="prompt-customizer-header"
      >
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          ✨ Customize DM Generation
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Paper
          elevation={3}
          sx={{ p: 3, mb: 3, height: '400px', overflowY: 'auto' }}
        >
          <Stack spacing={3}>
            {/* Message Tone Section */}
            {/* <Box>
              <Typography variant="body1" gutterBottom fontWeight="bold">
                Message Tone
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    Enthusiasm Level
                  </Typography>
                  <Tooltip title="Adjust how energetic and passionate the message should be">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={settings.enthusiasm}
                  onChange={handleSliderChange('enthusiasm')}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: 'Low' },
                    { value: 50, label: 'Medium' },
                    { value: 100, label: 'High' },
                  ]}
                  sx={{ width: '60%', ml: 3 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    Personalization Level
                  </Typography>
                  <Tooltip title="How personalized and targeted the message should be">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={settings.personalization}
                  onChange={handleSliderChange('personalization')}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: 'Generic' },
                    { value: 50, label: 'Balanced' },
                    { value: 100, label: 'Highly Personalized' },
                  ]}
                  sx={{ width: '60%', ml: 3 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    Formality Level
                  </Typography>
                  <Tooltip title="How formal or casual the message should be">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={settings.formality}
                  onChange={handleSliderChange('formality')}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: 'Casual' },
                    { value: 50, label: 'Balanced' },
                    { value: 100, label: 'Formal' },
                  ]}
                  sx={{ width: '60%', ml: 3 }}
                />
              </Box>
            </Box> */}

            <FormControl>
              <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>
                🎭 Message Tone
              </FormLabel>
              <RadioGroup value={settings.tone} onChange={handleToneChange}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    value="professional"
                    control={<Radio />}
                    label="👔 Professional"
                  />
                  <FormControlLabel
                    value="casual"
                    control={<Radio />}
                    label="😊 Casual"
                  />
                  <FormControlLabel
                    value="enthusiastic"
                    control={<Radio />}
                    label="🎉 Enthusiastic"
                  />
                  <FormControlLabel
                    value="formal"
                    control={<Radio />}
                    label="🎩 Formal"
                  />
                </Box>
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Message Length */}
            <FormControl component="fieldset">
              <FormLabel component="legend">📏 Message Length</FormLabel>
              <RadioGroup
                row
                value={settings.length}
                onChange={handleLengthChange}
              >
                <FormControlLabel
                  value="concise"
                  control={<Radio />}
                  label="⚡ Concise"
                />
                <FormControlLabel
                  value="moderate"
                  control={<Radio />}
                  label="📝 Moderate"
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio />}
                  label="📚 Detailed"
                />
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Call to Action */}
            <FormControl>
              <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>
                🎯 Call to Action
              </FormLabel>
              <RadioGroup
                value={settings.callToAction}
                onChange={handleCallToActionChange}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    value="direct"
                    control={<Radio />}
                    label="💪 Direct"
                  />
                  <FormControlLabel
                    value="soft"
                    control={<Radio />}
                    label="🤝 Soft"
                  />
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label="🚫 None"
                  />
                </Box>
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Key Points */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                📌 Key Points to Include
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyPoint()}
                  placeholder="Add a key point and press Enter"
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {settings.keyPoints.map((point) => (
                  <Chip
                    key={point}
                    label={point}
                    onDelete={() => handleRemoveKeyPoint(point)}
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Custom Instructions */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                ✍️ Custom Instructions
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={settings.customInstructions}
                onChange={handleCustomInstructionsChange}
                placeholder="Enter any specific instructions or requirements..."
              />
            </Box>
          </Stack>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export default CampaignPromptCustomizer;
