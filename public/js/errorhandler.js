        window.onerror = function (msg, url, line, col, error) {
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:20px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
            div.innerHTML = `ERROR: ${msg}\n${url}:${line}:${col}\n${error?.stack || ''}`;
            document.body.appendChild(div);
            return false;
        };
        window.addEventListener('unhandledrejection', function (event) {
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:orange;color:black;padding:20px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
            div.innerHTML = `PROMISE ERROR: ${event.reason}`;
            document.body.appendChild(div);
        });
