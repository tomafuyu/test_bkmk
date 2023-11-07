const cbs = chrome.bookmarks;
let current = "1";

/* {
    id,
    title,
    url,
    pid,
    last,
    type
} */
let mybookmarks = [];

const urlRegExp = /(^http:\/\/)|(^https:\/\/)|(^chrome:\/\/)|(^file:\/\/\/)/;

const $$ = (q, a=false) => a ? 
    document.querySelectorAll(q) 
    : document.querySelector(q);
const prompt = $$("#prompt");
const log_e = $$("#log");
const log = (s) => log_e.innerHTML += s;
let cmdline = $$("#cmdline");
const suggest = $$("#suggest");

cbs.getTree((tree) => {
    displayBookmarks(tree[0].children);
    console.table(mybookmarks);

    function displayBookmarks(nodes) {
        for (const node of nodes) {
            if (node.children) {
                mybookmarks.push({
                    id: node.id,
                    title: node.title,
                    pid: node.parentId,
                });
                displayBookmarks(node.children);
            } else if (node.url) {
                mybookmarks.push({
                    id: node.id,
                    title: node.title,
                    url: node.url,
                    pid: node.parentId,
                    last: node.dateLastUsed
                });
            }
        }
    }
});

prompt.addEventListener("click", () => cmdline.focus());

cmdline.addEventListener("keypress", (async (e) => {
    if (cmdline.value !== "" && e.key === "Enter") {
        let cmds = (cmdline.value.split(/ +/)).filter((w) => w !== " ");
        for (let i=1; i < cmds.length; ++i) {
            // concatenate if the space escaped by '\'
            if (cmds[i].match(/\\$/)) {
                console.log(cmds);
                cmds[i] = (cmds[i] + cmds[i+1]).replace(/\\/, " ");
                cmds.splice(i+1, 1);
                console.log(cmds);
            }
        }
        log(cmds.join(" ") + "<br>");

        switch (cmds[0]) {
            case "open": 
                await openCmd(cmds);
            break;
            case "ls": 
                await listCmd(cmds);
            break;
            case "tree":
                await listTree();
            case "cd": 
                await changeFolderCmd(cmds);
            break;
            default: ;
        } // switch
        initCmdLine();
    } else {
        ;
    }// if enter
}));

cmdline.focus();

function initCmdLine() {
    cmdline.value = "";
    // log("$ ");
    setTimeout(()=>log("$ "), 200);
}

function openCmd(cmds) {
    return new Promise((resolve) => {
        if (cmds[1]) {
            if (cmds[1].match(urlRegExp)) {
                window.open(cmds[1]);
            } else {
                cbs.search({title: cmds[1]}, (n) => {
                    if (n[0]?.url) {
                        window.open(n[0].url);
                    } else {
                        if (n[0]) log(`' ${cmds[1]} ' is folder.<br>`);
                        let sug = mybookmarks.filter(({title, url}) => 
                            url && (title.match(cmds[1]) || url.match(cmds[1]))
                        );
                        if (sug) {
                            log("maybe...<br>");
                            sug.map((e) => printLink(e));
                        }
                    }
                });
            }
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (e) => {
                chrome.tabs.create({index: e[0].index+1});
            });
        }
        resolve();
    });
}

function listCmd(cmds) {
    return new Promise((resolve, reject) => {
        try {
            if (cmds[1]) {
                cbs.search({
                    title: cmds[1]
                }, (n) => {
                    console.log(n);
                    if (n[0]?.url) {
                        listNodes(n[0]);
                    } else if (n[0]) {
                        cbs.getSubTree(n[0].id, (n) => n[0] && listNodes(n[0]));
                    }
                });
            } else {
                cbs.getSubTree(current, (n) => n[0] && listNodes(n[0]));
            }
            resolve();
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

function listNodes(node) {
    if (node.children) {
        for (const n of node.children) {
            if (n.children) {
                log(`${n.title}<br>`);
            }
            if (n.url) {
                printLink(n);
            }
        }
    } else if (node.url) {
        printLink(node)
    }
}

function printLink(o, tag="") {
    // o : {title, url}
    let open  = tag ? `<${tag}>`  : "";
    let close = tag ? `</${tag}>` : "";
    log(`${open}
        ${o.title} 
        <a href="${o.url}" 
            target="_blank"
            rel="noreferrer noopener"
        >${o.url}</a>
        <br>
    ${close}`);
}

function listTree() {
    cbs.getTree((tree) => {
        let tree = "";
        makeDefList(tree[0].children, 0);
        log(tree);
        function makeDefList(nodes, layer) {
            for (const node of nodes) {
                if (node.children) {
                    makeDefList(node.children, layer + 1);
                } else if (node.url) {
                }
            }
        }
    });
}

function changeFolderCmd(cmds) {
    return new Promise((resolve, reject) => {
        try {
            if (cmds[1]) {
                ;
            } else {
                current = "1";
            }
            resolve();
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
// cbs.get(current, (e) => console.log(e[0]));
// cbs.get('1', (root) => {
//     prompt.innerHTML += root[0].title + "<br>";
// });
// cbs.search({url: "https://fast.com/ja/"}, (nodes) => {
//     for (const n of nodes) prompt.innerHTML += n.title + n.url + "<br>";
// });
// search.addEventListener("input", () => {
//     list.innerHTML = "";
//     let r = new RegExp(`^${search.value}`);
//     // console.log(r);
//     for (const d of (details)) {
//         if (d.title.match(r)) {
//             list.innerHTML += `<p>
//                 ${d.title} - - - ${d.url}
//             </p>`;
//         }
//     }
// });
function addBookmark(title, url, pid) {
    cbs.create(
        {
            parentId: '1',
            title: 'Google',
            url: 'https://www.google.com'
        },
        () => {
            console.log('Bookmark added');
            location.reload(); // Refresh the popup
        }
    );
}
function removeBookmark() {
    cbs.search({url:'https://www.google.com/'}, (results) => {
        for (const result of results) {
            if (result.url === 'https://www.google.com/') {
                cbs.remove(result.id, () => {});
            }
        }
        location.reload();
    });
}