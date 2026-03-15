# Paperclip Update / Redeploy Commands

## Full Redeploy Steps

### 1) Go to the repo
```bash
cd /home/paperclip/mighty-paperclip
```

### 2) Check current branch and status
```bash
git branch --show-current
git status
```

### 3) Pull latest code
If you are already on the correct branch:

```bash
git pull
```

If you want a specific branch:

```bash
git checkout main
git pull origin main
```

Replace `main` with your branch if needed.

### 4) Install updated dependencies
```bash
pnpm install
```

### 5) Build the app
```bash
pnpm build
```

### 6) Restart the service
```bash
sudo systemctl restart paperclip
```

### 7) Check service status
```bash
sudo systemctl status paperclip
```

### 8) Watch logs
```bash
journalctl -u paperclip -f
```

## Fast Update Flow
```bash
cd /home/paperclip/mighty-paperclip
git pull
pnpm install
pnpm build
sudo systemctl restart paperclip
journalctl -u paperclip -n 100 --no-pager
```

## If `package.json` Changed a Lot or Build Acts Weird

### Clean install
```bash
cd /home/paperclip/mighty-paperclip
rm -rf node_modules
pnpm install
pnpm build
sudo systemctl restart paperclip
```

### Clean install + clear build caches
```bash
cd /home/paperclip/mighty-paperclip
rm -rf node_modules .next dist build
pnpm install
pnpm build
sudo systemctl restart paperclip
```

## If There Are Database Schema Changes
After pulling and installing, run your migration command before restarting.

Example placeholder:

```bash
cd /home/paperclip/mighty-paperclip
pnpm install
pnpm migrate
pnpm build
sudo systemctl restart paperclip
```

If your repo uses a different migration command, replace `pnpm migrate` with the correct one.

## Check Available Scripts
To see what scripts your repo supports:

```bash
cd /home/paperclip/mighty-paperclip
cat package.json
```

Or only the scripts section:

```bash
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

## Rollback Quick Idea
If latest pull breaks production:

```bash
cd /home/paperclip/mighty-paperclip
git log --oneline -n 5
git checkout <older-commit-sha>
pnpm install
pnpm build
sudo systemctl restart paperclip
```

If you want to return to the branch later:

```bash
git checkout main
git pull origin main
```

## Recommended Normal Workflow
```bash
cd /home/paperclip/mighty-paperclip
git pull
pnpm install
pnpm build
sudo systemctl restart paperclip
sudo systemctl status paperclip
journalctl -u paperclip -n 50 --no-pager
```