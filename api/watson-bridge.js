export default async function handler(req, res) {
  // Security check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      action,
      conversationType,
      projectUpdates,
      strategicInsights,
      researchNeeds,
      emailRequests,
      dashboardData
    } = req.body;

    console.log('Processing Watson request:', { action, conversationType, timestamp: new Date() });

    // Handle different types of strategic communications
    switch (action) {
      case 'strategic-analysis':
        await processStrategicAnalysis({
          insights: strategicInsights,
          projects: projectUpdates,
          research: researchNeeds
        });
        break;

      case 'dashboard-update':
        await updateDashboardWithContext(dashboardData);
        break;

      case 'send-email':
        await triggerStrategicEmail(emailRequests);
        break;

      case 'complex-update':
        // Handle multi-faceted strategic updates
        await processComplexStrategicUpdate({
          projectUpdates,
          strategicInsights,
          dashboardData,
          emailRequests
        });
        break;

      default:
        return res.status(400).json({ error: 'Unknown action type' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Strategic update processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
}

// Strategic analysis processor
async function processStrategicAnalysis({ insights, projects, research }) {
  // Create comprehensive GitHub issue with strategic context
  const issueContent = `
Strategic Analysis Update

## Key Insights
${insights || 'Strategic insights from portfolio discussion'}

## Project Context Updates
${formatProjectUpdates(projects)}

## Additional Research Needed
${research || 'Research requirements identified during strategic conversation'}

## Strategic Synthesis
Cross-project implications and strategic positioning adjustments identified.
`;

  await createGitHubIssue('[DASHBOARD] Strategic Analysis Update', issueContent);
  
  // Also trigger strategic email if insights are significant
  if (insights && insights.length > 100) {
    await createGitHubIssue('[EMAIL] Strategic Insights Brief', `
Strategic insights brief
Custom strategic communication
Key insights: ${insights.substring(0, 200)}...
    `);
  }
}

// Dashboard update with nuanced context
async function updateDashboardWithContext(dashboardData) {
  const issueContent = `
Dashboard Update with Strategic Context

${formatDashboardUpdates(dashboardData)}

Focus: ${dashboardData.currentFocus || 'Strategic portfolio execution'}
Strategic Context: ${dashboardData.context || 'Updates from strategic conversation'}
`;

  await createGitHubIssue('[DASHBOARD] Contextual Update', issueContent);
}

// Strategic email trigger
async function triggerStrategicEmail(emailRequests) {
  for (const email of emailRequests) {
    const issueContent = `
${email.type || 'strategic communication'}

${email.content || 'Strategic communication from portfolio conversation'}

Recipient context: ${email.recipient || 'strategic stakeholder'}
Strategic framework: ${email.framework || 'portfolio-based strategic approach'}
    `;

    await createGitHubIssue(`[EMAIL] ${email.subject || 'Strategic Communication'}`, issueContent);
  }
}

// Complex strategic update processor
async function processComplexStrategicUpdate({ projectUpdates, strategicInsights, dashboardData, emailRequests }) {
  // Process dashboard updates
  if (dashboardData) {
    await updateDashboardWithContext(dashboardData);
  }

  // Process strategic insights
  if (strategicInsights) {
    await processStrategicAnalysis({ insights: strategicInsights, projects: projectUpdates });
  }

  // Process email requests
  if (emailRequests && emailRequests.length > 0) {
    await triggerStrategicEmail(emailRequests);
  }
}

// Utility functions
function formatProjectUpdates(projects) {
  if (!projects) return 'No specific project updates provided';
  
  return Object.entries(projects).map(([project, update]) => {
    return `**${project}:** ${update.progress || 'No progress specified'}% - ${update.context || 'Strategic context from conversation'}`;
  }).join('\n');
}

function formatDashboardUpdates(data) {
  if (!data || !data.projects) return 'General dashboard update from strategic conversation';
  
  return Object.entries(data.projects).map(([project, value]) => {
    return `${project}: ${value}`;
  }).join('\n');
}

// GitHub API integration
async function createGitHubIssue(title, body) {
  const response = await fetch(`https://api.github.com/repos/vishp89/Intuitive-System/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      body: body
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${error}`);
  }

  return await response.json();
}
