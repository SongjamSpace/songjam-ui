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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
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

  const handleSliderChange = (field: keyof PromptSettings) => (
    _: Event,
    value: number | number[]
  ) => {
    onChange({ ...settings, [field]: value });
  };

  const handleToneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, tone: event.target.value as PromptSettings['tone'] });
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
    if (newKeyPoint.trim() && !settings.keyPoints.includes(newKeyPoint.trim())) {
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
    <Paper
      sx={{
        p: 3,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        ✨ Customize DM Generation
      </Typography>

      <Stack spacing={3}>
        {/* Tone Selection */}
        <FormControl>
          <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>
            🎭 Message Tone
          </FormLabel>
          <RadioGroup value={settings.tone} onChange={handleToneChange}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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

        {/* Message Length */}
        <FormControl>
          <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>
            📏 Message Length
          </FormLabel>
          <RadioGroup value={settings.length} onChange={handleLengthChange}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            </Box>
          </RadioGroup>
        </FormControl>

        {/* Enthusiasm Level */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              🔥 Enthusiasm Level
            </Typography>
            <Tooltip title="Adjust how enthusiastic and energetic the message should be">
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
              { value: 0, label: '😐 Low' },
              { value: 50, label: '😊 Medium' },
              { value: 100, label: '🤩 High' },
            ]}
          />
        </Box>

        {/* Personalization Level */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              🎯 Personalization Level
            </Typography>
            <Tooltip title="How much to personalize the message based on the speaker's profile">
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
              { value: 0, label: '📋 Generic' },
              { value: 50, label: '⚖️ Balanced' },
              { value: 100, label: '🎨 Highly Personalized' },
            ]}
          />
        </Box>

        {/* Formality Level */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              🎭 Formality Level
            </Typography>
            <Tooltip title="How formal or informal the language should be">
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
              { value: 0, label: '👕 Casual' },
              { value: 50, label: '👔 Neutral' },
              { value: 100, label: '🎩 Formal' },
            ]}
          />
        </Box>

        {/* Call to Action */}
        <FormControl>
          <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>
            🎯 Call to Action
          </FormLabel>
          <RadioGroup value={settings.callToAction} onChange={handleCallToActionChange}>
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

        {/* Key Points */}
        <Box>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>
            📌 Key Points to Include
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {settings.keyPoints.map((point) => (
              <Chip
                key={point}
                label={point}
                onDelete={() => handleRemoveKeyPoint(point)}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              value={newKeyPoint}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              placeholder="➕ Add a key point"
              fullWidth
            />
            <IconButton
              onClick={handleAddKeyPoint}
              disabled={!newKeyPoint.trim()}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            >
              ➕
            </IconButton>
          </Box>
        </Box>

        {/* Custom Instructions */}
        <Box>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>
            ✍️ Custom Instructions
          </Typography>
          <TextField
            multiline
            rows={3}
            value={settings.customInstructions}
            onChange={handleCustomInstructionsChange}
            placeholder="💡 Add any specific instructions or requirements for the message generation..."
            fullWidth
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default CampaignPromptCustomizer; 