# Run Sentinel on your old laptop

The first setup is private and local. There is no need to share passwords, tokens, or remote desktop credentials in chat.

## Windows

1. Confirm Python 3.10+ is installed by running `py -3 --version` in Command Prompt.
2. Download and extract the GitHub repository.
3. Open `projects/project-sentinel` and double-click `start-windows.bat`.
4. Keep that window open and visit **http://127.0.0.1:8765** on the laptop.

If the Python command is missing, install Python from [python.org](https://www.python.org/downloads/) and retry.

## macOS or Linux

In a terminal opened in `projects/project-sentinel`:

```sh
python3 --version
python3 app.py
```

Then open **http://127.0.0.1:8765** on the same laptop. You can also run `sh start-mac-linux.sh`.

## Daily use

- Leave the process running while monitoring is needed. The browser may be closed.
- Monitoring pauses when the laptop sleeps or turns off. Keeping it plugged in does not by itself prevent sleep.
- Stop with Ctrl+C. Restarting restores projects and alert states from `data/sentinel.sqlite3`.
- For a backup, stop the application and copy the `data` directory to your chosen backup location.
- Start with the included synthetic projects, then create your own project or import an export.
- Change the interval with `--interval 120` for a two-minute scan. The default is 60 seconds.

## Using another computer

The app currently accepts connections only from the laptop itself. We have not connected or configured your laptop remotely. The next setup step is to identify its operating system and choose an authenticated private access method. Do not enable router port forwarding or change the server to a public bind address as a shortcut.

A shared or internet-facing version needs authentication, HTTPS, process supervision, backup and update procedures. Those are a separate deployment step, not claims of this local MVP.

## Optional local AI

The core monitor works without a GPU or a language model. Local-model speed and memory requirements depend on the model and hardware; they have not been benchmarked for your laptop. After confirming your RAM and CPU, select a local Ollama model appropriate for that device. Start Sentinel with `--model` and the installed model name. The AI button adds a draft explanation; it never replaces the deterministic checks.
