const errorService = require('../services/errorService');
const aiService    = require('../services/aiService');

async function receiveError(req, res, next) {
  try {
    const { message, stack, url, userAgent } = req.body;
    const projectId = req.project.id;

    const { issueId, isNew } = await errorService.saveError({
      projectId,
      message,
      stackTrace: stack,
      url,
      userAgent: userAgent || req.headers['user-agent'],
    });
    /*
    // Yeni issue ise AI analizini arka planda başlat (cevabı bekleme)
    if (isNew) {
      aiService.analyzeError(issueId, message, stack).catch(console.error);
    }
    */  
    
    // Test için if (isNew) kontrolünü siliyoruz, her hatada AI çalışsın!
aiService.analyzeError(issueId, message, stack).catch(console.error);

    res.status(201).json({ success: true, issueId });
  } catch (err) {
    next(err);
  }
}

async function listIssues(req, res, next) {
  try {
    const projectId = req.project.id;
    const { status } = req.query;
    const issues = await errorService.getIssues(projectId, status);
    res.json(issues);
  } catch (err) {
    next(err);
  }
}

async function getIssueDetail(req, res, next) {
  try {
    const data = await errorService.getIssueById(req.params.id);
    if (!data.issue) return res.status(404).json({ error: 'Issue bulunamadı.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['open', 'resolved', 'ignored'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz status.' });
    }
    await errorService.updateIssueStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { receiveError, listIssues, getIssueDetail, updateStatus };
