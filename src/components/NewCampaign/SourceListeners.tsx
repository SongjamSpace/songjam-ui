import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { twitterSpaceTopics } from './TwitterSpaceTopics';
import { LoadingButton } from '@mui/lab';

type SourceListenersProps = {
  handleGenerateDMs: (noOfDms: number) => void;
  numListeners: number;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
};

const SourceListeners: React.FC<SourceListenersProps> = ({
  handleGenerateDMs,
  numListeners,
  selectedTopics,
  setSelectedTopics,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] =
    useState<string[]>(twitterSpaceTopics);
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
            Pick upto 3 topics:
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
                  color={selectedTopics.includes(topic) ? 'info' : 'default'}
                  onClick={() => {
                    if (
                      !selectedTopics.includes(topic) &&
                      selectedTopics.length < 3
                    ) {
                      setSelectedTopics([...selectedTopics, topic]);
                    } else if (selectedTopics.includes(topic)) {
                      setSelectedTopics(
                        selectedTopics.filter((t) => t !== topic)
                      );
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
