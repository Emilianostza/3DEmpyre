# Operations Runbook - Managed Capture 3D Platform

**Audience:** DevOps, SRE, Operations Team
**Severity Levels:** P1 (Critical/Immediate), P2 (High/1 hour), P3 (Medium/4 hours), P4 (Low/Next business day)
**Update Frequency:** Monthly or after incidents

---

## Quick Reference

### Emergency Contacts

- **On-Call DevOps:** Escalate critical issues
- **Netlify Support:** Build/deployment issues
- **Supabase Support:** Database/auth issues
- **Team Slack:** #incidents channel for coordination

### Key Dashboards

- **Netlify:** https://app.netlify.com/sites/your-site-name/overview
- **Supabase:** https://app.supabase.com/project/your-project-id
- **Status Pages:**
  - Netlify: https://www.netlify.com/status
  - Supabase: https://status.supabase.com

---

## Incident Response

### P1: Site Down (All Users Affected)

**Detection:**

- Uptime monitoring alerts (if configured)
- Slack notifications from incident bot
- User reports in support channel

**Immediate Actions (First 5 minutes):**

1. **Verify the Issue**

   ```bash
   # Check site is actually down
   curl -I https://your-domain.netlify.app
   # Should return 200 OK if working

   # Check DNS resolution
   nslookup your-domain.netlify.app
   ```

2. **Check Status Pages**
   - Netlify Status: https://www.netlify.com/status
   - Supabase Status: https://status.supabase.com
   - Is there a known incident?

3. **Post Initial Update**
   - Post to #incidents: "Investigating [Issue Description]"
   - Start incident clock

4. **Gather Logs**

   ```
   Netlify Dashboard:
   → Deploys → Latest deploy
   → Check "Deploy log"

   Supabase Dashboard:
   → Logs → All logs
   → Check for errors
   ```

**Troubleshooting (5-15 minutes):**

| Symptom                     | Cause         | Fix                                     |
| --------------------------- | ------------- | --------------------------------------- |
| 502/503 Error               | Build failing | Check build log, fix error, redeploy    |
| Site loads but blank        | JS error      | Check console, verify Supabase URL      |
| Login fails (401)           | Auth config   | Verify env vars, test Supabase directly |
| Database queries fail (403) | RLS policy    | Check user org membership, RLS rules    |
| Very slow loads             | Network/DB    | Check Supabase status, monitor queries  |

**Recovery Options:**

1. **If Recent Deploy Caused Issue:**

   ```
   Netlify Dashboard:
   → Deploys
   → Find previous successful deploy
   → Click "Publish deploy"
   ```

2. **If Build is Broken:**

   ```bash
   # Fix code locally
   git fix-your-issue
   git push origin main
   # Netlify auto-deploys
   ```

3. **If Database is Down:**
   - Wait for Supabase to recover
   - Notify users: "Database maintenance in progress"
   - Check https://status.supabase.com for updates

**Post-Incident (After Recovery):**

1. **Verify Everything Works**
   - [ ] Site loads
   - [ ] Login works
   - [ ] Can see projects
   - [ ] No console errors
   - [ ] API calls succeed

2. **Post Summary**

   ```
   #incidents:
   [RESOLVED] Issue description
   Duration: X minutes
   Impact: [Number] users affected
   Root cause: [Brief explanation]
   Resolution: [What we did]
   Prevention: [How to avoid next time]
   ```

3. **Schedule Incident Review**
   - Team meeting within 24 hours
   - Document in wiki/runbook
   - Update this runbook if needed

---

### P2: High Error Rate / Degraded Performance

**Detection:**

- Error rate > 5% in logs
- Response time > 3 seconds
- Supabase connection pool exhausted
- Memory usage > 80%

**Response (Within 1 hour):**

1. **Identify the Issue**

   ```
   Netlify Analytics:
   → Deployments section
   → Look for errors/slowness spike

   Supabase Logs:
   → Look for query timeouts
   → Check connection pool status
   → Monitor database load
   ```

2. **Temporary Mitigations**
   - Increase query timeout (if configurable)
   - Clear CDN cache (Netlify → Deploy settings)
   - Restart functions (if applicable)

3. **Root Cause Analysis**
   - Check for recently deployed changes
   - Monitor database query performance
   - Check for N+1 query problems
   - Review error logs for patterns

4. **Resolution**
   - Deploy hotfix if code issue
   - Optimize query if database issue
   - Scale resources if capacity issue

---

### P3: Authentication Issues

**Symptom:** Users report login failures

**Common Causes:**

| Error                    | Cause                     | Fix                                 |
| ------------------------ | ------------------------- | ----------------------------------- |
| "Invalid credentials"    | Wrong email/password      | Verify user exists in Supabase Auth |
| "User profile not found" | No user_profiles record   | Create profile record               |
| 403 Forbidden            | RLS policy denying access | Check user_org_memberships          |
| "No active session"      | Token expired             | User needs to log in again          |

**Investigation:**

1. **Check User Exists**

   ```
   Supabase Dashboard:
   → Authentication → Users
   → Search for user email
   → Verify user status = "confirmed"
   ```

2. **Check User Profile**

   ```
   Supabase Dashboard:
   → SQL Editor
   → SELECT * FROM user_profiles WHERE email = 'user@example.com'
   → Should have: id, email, name, org_id
   ```

3. **Check Organization Membership**

   ```
   SELECT * FROM user_org_memberships
   WHERE user_id = 'user-id'
   AND org_id = 'org-id'
   ```

4. **Test Supabase Auth Directly**
   ```
   Supabase Dashboard:
   → SQL Editor
   → Test: SELECT current_user
   ```

**Fix:**

- Missing user_profiles record: Create it
- Missing org_membership: Add user to org
- User not confirmed: Trigger email verification
- RLS policy issue: Review policy logic

---

### P3: Database Performance Degradation

**Symptoms:**

- Queries taking > 1 second
- Connection pool errors
- Timeout errors

**Investigation:**

1. **Check Supabase Status**

   ```
   Supabase Dashboard:
   → Monitoring
   → Check database load
   → Check connection pool usage
   ```

2. **Review Slow Queries**

   ```
   Supabase Dashboard:
   → Logs
   → Filter for slow queries (> 1000ms)
   → Check query plan
   ```

3. **Check for Lock Contention**
   ```
   SELECT pg_sleep(100); -- Test if queries lock
   ```

**Solutions:**

- Add index: `CREATE INDEX ON table(column)`
- Optimize query: Use EXPLAIN ANALYZE
- Increase pool size: Supabase settings
- Scale database: Upgrade plan
- Reduce query load: Enable caching

---

### P3: Frontend JavaScript Errors

**Symptoms:**

- Console shows red errors
- Features not working
- Blank page or partial UI

**Investigation:**

1. **Check Console (F12)**
   - Note exact error message
   - Check stack trace
   - Identify affected feature

2. **Reproduce Issue**
   - Try in private/incognito window
   - Try in different browser
   - Check if environment-specific

3. **Check Browser DevTools**
   - Network tab: Any failed requests?
   - Sources tab: Any source map issues?
   - Application tab: Check localStorage

**Common Causes:**

| Error                                   | Cause                   | Fix                            |
| --------------------------------------- | ----------------------- | ------------------------------ |
| "Cannot read property 'x' of undefined" | Missing data/null check | Update code, deploy hotfix     |
| "Module not found"                      | Build error             | Check build log, fix import    |
| "CORS error"                            | Wrong domain/headers    | Verify Supabase URL, check CSP |
| "localStorage is undefined"             | SSR/build issue         | Check browser compatibility    |

**Fix:**

1. Identify cause
2. Create fix locally
3. Deploy hotfix: `git push origin main`
4. Verify fix works on prod

---

## Maintenance Tasks

### Daily (Automated)

- ✅ Netlify auto-builds on push
- ✅ Supabase auto-backups run
- ✅ SSL certificates auto-renew

**Manual Check:**

- [ ] 9 AM: Check Netlify dashboard for overnight issues
- [ ] 5 PM: Quick health check (can login, see projects)

### Weekly

**Monday Morning:**

```bash
# Review incident summary from #incidents channel
# Identify patterns, update runbook if needed
```

**Anytime:**

```bash
# Manual Performance Check
1. Load site (F12 open)
2. Check Network tab response times
3. Check Console for warnings
4. Try create project (tests full flow)
5. Try logout/login
```

**Action Items:**

- [ ] Review error logs for patterns
- [ ] Check database performance metrics
- [ ] Verify backups completed successfully
- [ ] Update security patches if available

### Monthly

1. **Disaster Recovery Drill**

   ```bash
   # Test restore procedure
   1. Supabase Dashboard → Settings → Backups
   2. Note latest backup
   3. (Don't actually restore on prod, use staging)
   4. Document restore took X minutes
   5. Update runbook
   ```

2. **Dependency Updates**

   ```bash
   # Check for updates
   npm outdated

   # Update non-major versions
   npm update

   # Commit and push
   git add package*.json
   git commit -m "chore: update dependencies"
   git push origin main
   ```

3. **Security Audit**
   - Check GitHub security alerts
   - Review Netlify/Supabase security settings
   - Verify no hardcoded secrets in code

4. **Performance Review**

   ```
   Netlify Analytics:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

   Goal: All < target thresholds
   ```

### Quarterly

1. **Full Backup Test**
   - Actually restore database from backup
   - Verify all data intact
   - Time the restoration
   - Update runbook with timing

2. **Load Testing** (if applicable)

   ```bash
   # Generate artificial traffic
   # Monitor system under load
   # Identify bottlenecks
   # Document findings
   ```

3. **Security Review**
   - Audit all environment variables
   - Review RLS policies
   - Check for hardcoded secrets
   - Verify CORS configuration

4. **Team Training**
   - Run incident simulation
   - Practice escalation procedure
   - Review this runbook with team
   - Update for any process changes

---

## Common Operational Tasks

### Task: Deploy New Version

```bash
# On main branch
git push origin main

# Or manually trigger
Netlify Dashboard → Deploys → Trigger deploy

# Monitor build
Netlify Dashboard → Deploys → Latest deploy → View build log

# Verify deployment
1. Wait for "✓ built in X.XXs"
2. Click deployment link
3. Test site loads
4. Verify no console errors
```

### Task: Update Environment Variables

```
Netlify Dashboard:
→ Site settings
→ Build & Deploy
→ Environment
→ Edit variables
→ Save

Then:
→ Deploys
→ Trigger deploy (to pick up new env vars)
```

### Task: Add New User to Supabase

```
Supabase Dashboard:
→ Authentication
→ Users
→ Add user
→ Email: user@example.com
→ Password: (auto-generated or custom)
→ Check "Auto confirm user"
→ Create user

Then create profile:
→ SQL Editor
→ INSERT INTO user_profiles (id, email, name, org_id)
  VALUES ('user-id', 'user@example.com', 'Name', 'org-id')
```

### Task: Create Database Backup

```
Manual backup:
Supabase Dashboard:
→ Settings
→ Backups
→ Manual backups
→ Trigger backup

Backups are stored and can be restored from same page
```

### Task: Clear CDN Cache

```
Netlify Dashboard:
→ Build & deploy
→ Deployments
→ (Current deploy)
→ (3 dots menu)
→ Clear cache
→ Trigger redeploy

Or: Settings → Domain management → (trigger new deploy)
```

### Task: Rollback to Previous Version

```
Netlify Dashboard:
→ Deploys
→ Find previous deploy you want
→ Click "Publish deploy"

Takes effect immediately. To verify:
1. Visit site
2. Check version/timestamp
3. Verify features working
```

### Task: View Error Logs

```
Browser Console (F12):
- Shows frontend JavaScript errors
- Shows API request errors
- Shows auth errors

Netlify Analytics/Logs:
- No direct error log viewer
- Monitor via Supabase logs

Supabase Logs:
- Dashboard → Logs
- Shows all database queries
- Shows errors and timeouts
- Can filter by level/time
```

---

## Monitoring & Alerting

### What to Monitor

| Metric               | Target       | Alert If     |
| -------------------- | ------------ | ------------ |
| Site availability    | 99.9% uptime | Down > 5 min |
| Build success rate   | 100%         | Failed build |
| Page load time (LCP) | < 2.5s       | > 5s         |
| Error rate           | < 1%         | > 5%         |
| DB query time        | < 500ms      | > 2s         |
| Auth success rate    | > 99%        | < 95%        |

### Recommended Tools

- **Uptime Monitoring:** Pingdom, UptimeRobot, or similar
- **Error Tracking:** Sentry (optional, not yet integrated)
- **Performance:** Lighthouse CI, WebPageTest
- **Alerts:** Slack webhooks, email

### Current Setup

- Netlify build notifications: Not yet configured
- Supabase monitoring: Available in dashboard
- Custom alerts: Can be added to netlify.toml

**To configure:**

```
Netlify Dashboard:
→ Site settings
→ Build & deploy
→ Notifications
→ Add notification (Slack/email)
```

---

## Knowledge Base

### Common Questions

**Q: How do I know if the site is down?**
A: Check these in order:

1. Visit https://your-domain.netlify.app in browser
2. Check #incidents Slack channel
3. Check https://status.supabase.com
4. Check Netlify dashboard

**Q: How often do backups run?**
A: Supabase runs automatic backups daily. Retention is 30 days.

**Q: Can I deploy without going through Netlify?**
A: No. Netlify is the only deployment method. Must push to main branch.

**Q: How do I add a new project/org to database?**
A: Use Supabase SQL Editor or use app's admin panel after login.

**Q: What should I do if I accidentally break something?**
A: Revert the commit: `git revert <hash>` then `git push origin main`

**Q: Where are secrets/API keys stored?**
A: In Netlify environment variables (Settings → Build & Deploy → Environment)

**Q: Can I edit environment variables without redeploying?**
A: No. After changing env vars, trigger a new deploy for changes to take effect.

---

## Escalation Matrix

### P1 - CRITICAL (Respond: 5 min, Resolve: 30 min)

- **Example:** Site completely down, database unavailable
- **Escalate to:** On-call DevOps
- **Communication:** Immediate Slack #incidents, customer notification
- **Post-incident:** Review meeting within 24 hours

### P2 - HIGH (Respond: 15 min, Resolve: 1 hour)

- **Example:** High error rate, auth failures, severe slowness
- **Escalate to:** DevOps lead
- **Communication:** Slack #incidents, status page if needed
- **Post-incident:** Incident ticket + brief review

### P3 - MEDIUM (Respond: 1 hour, Resolve: 4 hours)

- **Example:** Minor errors, non-critical features broken
- **Escalate to:** Engineering team
- **Communication:** Team email, next standup
- **Post-incident:** Add to backlog

### P4 - LOW (Respond: 24 hours, Resolve: Next business day)

- **Example:** Documentation updates, minor UI glitches
- **Escalate to:** Regular backlog
- **Communication:** JIRA ticket, non-urgent
- **Post-incident:** Standard sprint

---

## Reference Information

### Directory Structure

```
.
├── src/                    # React application code
├── netlify/
│   └── functions/         # Serverless functions
├── docs/                  # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── OPERATIONS_RUNBOOK.md
│   ├── SUPABASE_SCHEMA.md
│   └── ...
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies
└── vite.config.ts         # Build configuration
```

### Important URLs

- **Site:** https://your-domain.netlify.app
- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Repo:** https://github.com/your-org/managed-capture-3d-platform
- **Team Wiki:** [link to your wiki]

### Important Contacts

```
Name: [Your DevOps Lead]
Email: [devops@company.com]
Phone: [+1-XXX-XXX-XXXX]
Slack: @devops-lead

On-Call Schedule: [Link to calendar]
Escalation Policy: [Link to policy]
```

---

## Version History

| Date       | Author | Changes                  |
| ---------- | ------ | ------------------------ |
| 2026-02-11 | Claude | Initial runbook creation |

**Last Updated:** February 11, 2026
**Next Review:** February 25, 2026 (2 weeks)

---

**Remember:** When in doubt, escalate. It's better to involve the team early than to let issues compound. Update this runbook after every incident.
