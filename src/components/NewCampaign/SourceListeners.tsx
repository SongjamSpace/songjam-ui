import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Avatar,
  TextField,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { SongjamUser } from '../../services/db/user.service';
import { Listener } from '../../services/db/listeners.service';
import { twitterSpaceTopics } from './TwitterSpaceTopics';
import { getPlanLimits } from '../../utils';
import { LoadingButton } from '@mui/lab';

type SourceListenersProps = {
  currentPlan: string;
  upgradePlan: () => void;
  user: SongjamUser;
  // listeners: Listener[];
  // setListeners: Dispatch<SetStateAction<Listener[]>>;
  handleGenerateDMs: (noOfDms: number) => void;
};

const SourceListeners: React.FC<SourceListenersProps> = ({
  currentPlan,
  upgradePlan,
  user,
  handleGenerateDMs,
  // listeners,
  // setListeners,
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] =
    useState<string[]>(twitterSpaceTopics);
  const [numListeners, setNumListeners] = useState(10);

  const planLimits = getPlanLimits(currentPlan);
  const maxDms = planLimits.autoDms;
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(twitterSpaceTopics);
    } else {
      const filtered = twitterSpaceTopics.filter((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box
          display={'flex'}
          alignItems={'center'}
          gap={2}
          // justifyContent={'space-between'}
        >
          <Typography variant="h6">Source Listeners</Typography>
          <Box display={'flex'} alignItems={'center'} gap={1}>
            <Chip size="small" label={`PLAN: ${currentPlan.toUpperCase()}`} />
            <Chip
              size="small"
              label={`Available: ${user?.usage.autoDms}/${maxDms} DMs`}
            />
          </Box>
        </Box>

        {/* Selected Topics Section */}
        {/* {selectedTopics.length > 0 && ( */}
        <Box
          display={'flex'}
          gap={2}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box display={'flex'} gap={1} flexWrap={'wrap'}>
            {selectedTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                variant="filled"
                onDelete={() => {
                  setSelectedTopics(selectedTopics.filter((t) => t !== topic));
                }}
              />
            ))}
          </Box>

          {/* Pick a number of listeners you want to target */}
          <Box
            display="flex"
            flexDirection={'column'}
            gap={1}
            alignItems="center"
          >
            <Autocomplete
              disablePortal
              options={[10, 100, 250, 500, 1000]}
              sx={{ width: 250 }}
              size="small"
              freeSolo
              value={numListeners}
              onChange={(event, newValue) => {
                if (typeof newValue === 'number') {
                  setNumListeners(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Number of AutoDMs"
                  type="number"
                />
              )}
            />
            {(currentPlan === 'free' || currentPlan === 'starter') && (
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                <span
                  onClick={upgradePlan}
                  style={{
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'underline',
                  }}
                >
                  Upgrade to {currentPlan === 'free' ? 'PRO' : 'BUSINESS'}
                </span>{' '}
                for unlimited auto DMs
              </Typography>
            )}
          </Box>
        </Box>
        {/* )} */}

        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            },
          }}
        />

        {/* Search Results */}
        {/* {searchQuery && ( */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Pick up to 3 topics:
          </Typography>
          <Grid
            container
            spacing={1}
            sx={{ overflowY: 'auto', maxHeight: '450px' }}
          >
            {filteredTopics.map((topic) => (
              <Grid item xs={6} sm={4} md={3} key={topic}>
                <Chip
                  label={topic}
                  variant={
                    selectedTopics.includes(topic) ? 'filled' : 'outlined'
                  }
                  onClick={() => {
                    if (!selectedTopics.includes(topic)) {
                      setSelectedTopics([...selectedTopics, topic]);
                    }
                  }}
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* )} */}

        {/* Space Cards Grid */}
        {/* <Grid
          container
          spacing={2}
          sx={{ overflowY: 'auto', maxHeight: '60vh' }}
        >
          {listeners.map((listener) => (
            <Grid item xs={12} md={6} key={listener.userId}>
              <ListenerCard listener={listener} />
            </Grid>
          ))}
        </Grid> */}

        {/* {campaign?.status === 'DRAFT' && ( */}
        <LoadingButton
          loading={actionLoading}
          variant="contained"
          color="primary"
          fullWidth
          onClick={async () => {
            setActionLoading(true);
            await handleGenerateDMs(numListeners);
            setActionLoading(false);
          }}
          // disabled={
          //   campaign.campaignType === 'speakers' &&
          //   selectedSpaces.length === 0
          // }
          sx={{ mt: 2 }}
        >
          Generate DMs
        </LoadingButton>
        {/* )} */}
      </Stack>
    </Box>
  );
};

// const ListenerCard: React.FC<{ listener: Listener }> = ({ listener }) => {
//   return (
//     <Card
//       sx={{
//         background:
//           'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid rgba(255,255,255,0.1)',
//         borderRadius: 2,
//         transition: 'transform 0.2s ease-in-out',
//         '&:hover': {
//           transform: 'translateY(-4px)',
//         },
//       }}
//     >
//       <CardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//           <Avatar
//             src={listener.avatarUrl}
//             alt={listener.displayName}
//             sx={{
//               width: 56,
//               height: 56,
//               border: '2px solid rgba(255,255,255,0.1)',
//             }}
//           />
//           <Box sx={{ flex: 1 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                 {listener.displayName}
//               </Typography>
//               {listener.isVerified && (
//                 <VerifiedIcon sx={{ color: '#1DA1F2', fontSize: 20 }} />
//               )}
//             </Box>
//             <Typography variant="body2" color="text.secondary">
//               @{listener.twitterScreenName}
//             </Typography>
//           </Box>
//         </Box>

//         <Stack spacing={1}>
//           {listener.biography && (
//             <Typography variant="body2" sx={{ mb: 1 }}>
//               {listener.biography}
//             </Typography>
//           )}

//           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//             {listener.location && (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
//                 <Typography variant="body2" color="text.secondary">
//                   {listener.location}
//                 </Typography>
//               </Box>
//             )}

//             {listener.followersCount && (
//               <Box sx={{ display: 'flex', gap: 2 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   {listener.followersCount} followers
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {listener.followingCount} following
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// };

export default SourceListeners;
