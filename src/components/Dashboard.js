import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Typography from '@mui/joy/Typography';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import CardActions from '@mui/joy/CardActions';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import Link from '@mui/joy/Link';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SportsIcon from '@mui/icons-material/Sports';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import PercentIcon from '@mui/icons-material/Percent';

// Função para formatar valores numéricos corretamente
const formatNumber = (value) => {
  console.log('Formatando valor:', value, 'tipo:', typeof value);
  
  if (value === undefined || value === null) return 'N/A';
  
  // Se for uma string que parece um número
  if (typeof value === 'string' && !isNaN(value)) {
    const parsedValue = parseInt(value, 10);
    console.log('Convertendo string para número:', value, '->', parsedValue);
    return parsedValue.toLocaleString();
  }
  
  // Se já for um número
  if (typeof value === 'number') {
    console.log('Formatando número:', value, '->', value.toLocaleString());
    return value.toLocaleString();
  }
  
  return value;
};

const Dashboard = ({ models, matches, predictions }) => {
  console.log('Dashboard recebeu props:', {
    models: models.length,
    matches: matches.length,
    predictions: predictions.length
  });
  
  // Log dos primeiros itens de cada array para debug
  console.log('Amostra de models:', models.slice(0, 2));
  console.log('Amostra de matches:', matches.slice(0, 2));
  console.log('Amostra de predictions:', predictions.slice(0, 2));
  
  // Estatísticas para resumo
  const totalMatches = matches.length;
  const totalPredictions = predictions.length;
  const totalModels = models.length;
  
  console.log('Valores totais:', { totalMatches, totalPredictions, totalModels });
  
  // Calcular média de acurácia dos modelos
  const avgAccuracy = models.length > 0 
    ? (models.reduce((acc, model) => {
        const accuracyValue = parseFloat(model.accuracy || 0);
        console.log('Valor de acurácia:', model.accuracy, '->', accuracyValue);
        return acc + accuracyValue;
      }, 0) / models.length).toFixed(2) + '%'
    : 'N/A';
  
  console.log('Acurácia média calculada:', avgAccuracy);
  
  // Dados para gráfico de distribuição de previsões
  const predictionDistribution = [
    { name: 'Over 2.5', value: predictions.filter(p => p.prediction === 'OVER_2.5').length },
    { name: 'Over 1.5', value: predictions.filter(p => p.prediction === 'OVER_1.5').length },
    { name: 'Over 0.5', value: predictions.filter(p => p.prediction === 'OVER_0.5').length }
  ];
  
  console.log('Distribuição de previsões:', predictionDistribution);
  
  const COLORS = ['#3498db', '#27ae60', '#f39c12'];

  // Próximas partidas com previsões
  const upcomingMatches = predictions
    .filter(p => new Date(p.match_date) > new Date())
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    .slice(0, 5);

  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarMonthIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography level="h2">
                {formatNumber(totalMatches)}
              </Typography>
              <Typography level="body-sm" textColor="text.tertiary">
                Total de Partidas
              </Typography>
            </CardContent>
            <CardOverflow variant="soft">
              <CardActions>
                <Link
                  component={RouterLink}
                  to="/matches"
                  sx={{ flex: 1, textAlign: 'center' }}
                  level="body-sm"
                  fontWeight="lg"
                >
                  Ver todas
                </Link>
              </CardActions>
            </CardOverflow>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography level="h2">
                {formatNumber(totalPredictions)}
              </Typography>
              <Typography level="body-sm" textColor="text.tertiary">
                Previsões
              </Typography>
            </CardContent>
            <CardOverflow variant="soft">
              <CardActions>
                <Link
                  component={RouterLink}
                  to="/predictions"
                  sx={{ flex: 1, textAlign: 'center' }}
                  level="body-sm"
                  fontWeight="lg"
                >
                  Ver detalhes
                </Link>
              </CardActions>
            </CardOverflow>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ModelTrainingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography level="h2">
                {formatNumber(totalModels)}
              </Typography>
              <Typography level="body-sm" textColor="text.tertiary">
                Modelos
              </Typography>
            </CardContent>
            <CardOverflow variant="soft">
              <CardActions>
                <Link
                  component={RouterLink}
                  to="/models"
                  sx={{ flex: 1, textAlign: 'center' }}
                  level="body-sm"
                  fontWeight="lg"
                >
                  Ver todos
                </Link>
              </CardActions>
            </CardOverflow>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PercentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography level="h2">
                {avgAccuracy}
              </Typography>
              <Typography level="body-sm" textColor="text.tertiary">
                Acurácia Média
              </Typography>
            </CardContent>
            <CardOverflow variant="soft">
              <Typography level="body-sm" sx={{ p: 1, textAlign: 'center' }}>
                Baseado em todos os modelos
              </Typography>
            </CardOverflow>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Card>
            <Typography level="title-lg" sx={{ p: 2 }}>
              Distribuição de Previsões
            </Typography>
            <CardContent>
              <AspectRatio ratio="1" sx={{ minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={predictionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {predictionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value), 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </AspectRatio>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6}>
          <Card>
            <Typography level="title-lg" sx={{ p: 2 }}>
              Próximas Partidas com Previsões
            </Typography>
            <Divider />
            <Sheet sx={{ 
              overflow: 'auto', 
              maxHeight: 400
            }}>
              {upcomingMatches.length > 0 ? (
                <Table 
                  hoverRow 
                  size="sm" 
                  stickyHeader 
                  stripe="odd"
                >
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Data</th>
                      <th style={{ width: '30%' }}>Partida</th>
                      <th style={{ width: '18%' }}>Previsão</th>
                      <th style={{ width: '18%' }}>Probabilidade</th>
                      <th style={{ width: '15%' }}>Odd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingMatches.map((match) => (
                      <tr key={match.match_id}>
                        <td>{new Date(match.match_date).toLocaleDateString('pt-BR')}</td>
                        <td>{match.home_team_name} vs {match.away_team_name}</td>
                        <td>
                          <Chip 
                            size="sm" 
                            color="success" 
                            variant="soft"
                          >
                            {match.prediction}
                          </Chip>
                        </td>
                        <td>{match.probability}</td>
                        <td>
                          {match.prediction === 'OVER_2.5' && formatNumber(match['odd over 2.5'])}
                          {match.prediction === 'OVER_1.5' && formatNumber(match['odd over 1.5'])}
                          {match.prediction === 'OVER_0.5' && formatNumber(match['odd over 0.5'])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography level="body-md">
                    Não há partidas previstas para os próximos dias.
                  </Typography>
                </Box>
              )}
            </Sheet>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 