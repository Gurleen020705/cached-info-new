import React from 'react';
import { 
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box
} from '@material-ui/core';
import { School, Code, Assignment } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    margin: theme.spacing(2),
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.03)',
    },
  },
  media: {
    height: 140,
    backgroundSize: 'contain',
  },
  chip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const ResourceCard = ({ 
  title, 
  description, 
  imageUrl, 
  url,
  type,
  university,
  domain,
  subject,
  skill,
  exam,
  onSave,
  isAuthenticated
}) => {
  const classes = useStyles();

  const getTypeIcon = () => {
    switch(type) {
      case 'university':
        return <School fontSize="small" />;
      case 'skill':
        return <Code fontSize="small" />;
      case 'competitive':
        return <Assignment fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Card className={classes.card}>
      <CardActionArea href={url} target="_blank" rel="noopener noreferrer">
        {imageUrl && (
          <CardMedia
            className={classes.media}
            image={imageUrl || '/default-resource-image.jpg'}
            title={title}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
          
          <Box mb={2}>
            <Chip
              icon={getTypeIcon()}
              label={type}
              color="primary"
              size="small"
              className={classes.chip}
            />
            
            {type === 'university' && university && (
              <Chip label={university} size="small" className={classes.chip} />
            )}
            {type === 'skill' && skill && (
              <Chip label={skill} size="small" className={classes.chip} />
            )}
            {type === 'competitive' && exam && (
              <Chip label={exam} size="small" className={classes.chip} />
            )}
          </Box>
          
          <Typography variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      <Box display="flex" justifyContent="space-between" p={2}>
        <Button 
          size="small" 
          color="primary"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Resource
        </Button>
        
        <Button 
          size="small" 
          color="secondary"
          onClick={onSave}
          disabled={!isAuthenticated}
        >
          {isAuthenticated ? 'Save' : 'Login to Save'}
        </Button>
      </Box>
    </Card>
  );
};

ResourceCard.defaultProps = {
  title: 'Resource Title',
  description: 'No description available',
  type: 'general',
  onSave: () => console.log('Save clicked'),
  isAuthenticated: false
};

export default ResourceCard;