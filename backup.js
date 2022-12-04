// node_modules/worktop/node_modules/regexparam/dist/index.mjs
function parse(str, loose) {
  if (str instanceof RegExp) return { keys: false, pattern: str };
  var c,
    o3,
    tmp,
    ext,
    keys = [],
    pattern = '',
    arr = str.split('/');
  arr[0] || arr.shift();
  while ((tmp = arr.shift())) {
    c = tmp[0];
    if (c === '*') {
      keys.push('wild');
      pattern += '/(.*)';
    } else if (c === ':') {
      o3 = tmp.indexOf('?', 1);
      ext = tmp.indexOf('.', 1);
      keys.push(tmp.substring(1, !!~o3 ? o3 : !!~ext ? ext : tmp.length));
      pattern += !!~o3 && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
      if (!!~ext) pattern += (!!~o3 ? '?' : '') + '\\' + tmp.substring(ext);
    } else {
      pattern += '/' + tmp;
    }
  }
  return {
    keys,
    pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i'),
  };
}

// node_modules/worktop/buffer/index.mjs
var b = /* @__PURE__ */ new TextEncoder();

// node_modules/worktop/utils/index.mjs
function l(r2) {
  return r2 ? b.encode(r2).byteLength : 0;
}

// node_modules/worktop/response/index.mjs
var d = 'content-type';
var o2 = 'content-length';
var y = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  413: 'Payload Too Large',
  422: 'Unprocessable Entity',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};
function u(e2, t2, s) {
  let r2 = {};
  for (let a in s) r2[a.toLowerCase()] = s[a];
  let n = r2[d],
    i2 = typeof t2;
  return (
    t2 == null
      ? (t2 = '')
      : i2 === 'object'
      ? ((t2 = JSON.stringify(t2)), (n = n || 'application/json;charset=utf-8'))
      : i2 !== 'string' && (t2 = String(t2)),
    (r2[d] = n || 'text/plain'),
    (r2[o2] = r2[o2] || String(t2.byteLength || l(t2))),
    new Response(t2, { status: e2, headers: r2 })
  );
}
var f = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function b2(e2, t2) {
  let s = f.has(e2.status);
  if (!t2 && !s) return e2;
  let r2 = new Response(null, e2);
  return s && r2.headers.delete(o2), e2.status === 205 && r2.headers.set(o2, '0'), r2;
}

// node_modules/worktop/router/index.mjs
function R(...s) {
  return async function (i2, p) {
    let t2, r2;
    for (t2 of s) if ((r2 = await t2(i2, p))) return r2;
  };
}
function h(s, i2, p) {
  let t2 = {},
    r2,
    o3,
    n,
    e2,
    a;
  if ((o3 = s[i2])) {
    if ((r2 = o3.__s[p])) return { params: t2, handler: r2.handler };
    for ([n, e2] of o3.__d)
      if (((a = n.exec(p)), a !== null)) {
        if (a.groups !== void 0) for (r2 in a.groups) t2[r2] = a.groups[r2];
        else if (e2.keys.length > 0) for (r2 = 0; r2 < e2.keys.length; ) t2[e2.keys[r2++]] = a[r2];
        return { params: t2, handler: e2.handler };
      }
  }
}
function _() {
  let s,
    i2,
    p = {};
  return (s = {
    add(t2, r2, o3) {
      let n = p[t2];
      if (
        (n === void 0 &&
          (n = p[t2] =
            {
              __d: new Map(),
              __s: {},
            }),
        r2 instanceof RegExp)
      )
        n.__d.set(r2, { keys: [], handler: o3 });
      else if (/[:|*]/.test(r2)) {
        let { keys: e2, pattern: a } = parse(r2);
        n.__d.set(a, { keys: e2, handler: o3 });
      } else n.__s[r2] = { keys: [], handler: o3 };
    },
    mount(t2, r2) {
      (i2 = i2 || {}), (i2[t2] = r2.run);
    },
    onerror(t2, r2) {
      let { error: o3, status: n = 500 } = r2,
        e2 = (o3 && o3.message) || y[n];
      return new Response(e2 || String(n), { status: n });
    },
    async run(t2, r2) {
      try {
        var o3,
          n = [];
        (r2 = r2 || {}),
          (r2.url = new URL(t2.url)),
          (r2.defer = (u2) => {
            n.push(u2);
          }),
          (r2.bindings = r2.bindings || {});
        var e2 = s.prepare && (await s.prepare(t2, r2));
        if (e2 && e2 instanceof Response) return e2;
        let a,
          f2 = r2.url.pathname,
          l2 = f2 + '/';
        if (i2 && f2.length > 1) {
          for (a in i2)
            if (l2.startsWith(a))
              return (
                (r2.url.pathname = f2.substring(a.length) || '/'),
                (e2 = await i2[a](new Request(r2.url.href, t2), r2))
              );
        }
        if (((a = h(p, t2.method, f2)), !a))
          return (r2.status = 404), (e2 = await s.onerror(t2, r2));
        (r2.params = a.params), (e2 = await a.handler(t2, r2));
      } catch (a) {
        (r2.status = 500), (r2.error = a), (e2 = await s.onerror(t2, r2));
      } finally {
        for (e2 = new Response(e2 ? e2.body : 'OK', e2); (o3 = n.pop()); ) await o3(e2);
        return b2(e2, t2.method === 'HEAD');
      }
    },
  });
}

// node_modules/worktop/cfw/index.mjs
function e(n) {
  return {
    fetch(i2, o3, t2) {
      return n(i2, {
        bindings: o3,
        waitUntil: t2.waitUntil.bind(t2),
        passThroughOnException: t2.passThroughOnException.bind(t2),
      });
    },
  };
}

// node_modules/@finsweet/ts-utils/dist/type-guards/isKeyOf.js
var isKeyOf = (key, source) => !!key && source.includes(key);

// node_modules/@finsweet/ts-utils/dist/helpers/extractCommaSeparatedValues.js
function extractCommaSeparatedValues(string, compareSource, defaultValue, filterEmpty = true) {
  const emptyValue = defaultValue ? [defaultValue] : [];
  if (!string) return emptyValue;
  const items = string.split(',').reduce((accumulatedValue, currentValue) => {
    const value = currentValue.trim();
    if (!filterEmpty || value) accumulatedValue.push(value);
    return accumulatedValue;
  }, []);
  if (compareSource) {
    const matches = items.filter((item) => isKeyOf(item, compareSource));
    return matches.length ? matches : emptyValue;
  }
  return items;
}

// src/main.ts
var handler = async (request, context) => {
  const {
    params: { path1, wild },
    url: { hostname, search },
    bindings: { DOMAIN, MAIN_SUBDOMAIN, WEBFLOW_SUBDOMAIN, SUBDOMAINS },
  } = context;
  const subdomains = extractCommaSeparatedValues(SUBDOMAINS);
  const fullPath = buildPath(path1, wild, search);
  if (hostname !== `${MAIN_SUBDOMAIN}.${DOMAIN}`) {
    const subdomain = subdomains.find((subdomain2) => hostname.startsWith(subdomain2));
    if (subdomain)
      return u(
        301,
        {},
        { Location: `https://${MAIN_SUBDOMAIN}.${DOMAIN}/${subdomain}/${fullPath}` }
      );
    return fetch(request);
  }
  if (path1 && subdomains.includes(path1)) {
    return fetch(`https://${path1}.${DOMAIN}/${buildPath(void 0, wild, search)}`);
  }
  const response = await fetch(`https://${WEBFLOW_SUBDOMAIN}.${DOMAIN}/${fullPath}`);
  if (
    response.redirected &&
    response.url &&
    !response.url.includes(`${WEBFLOW_SUBDOMAIN}.${DOMAIN}`)
  ) {
    return u(301, {}, { location: response.url });
  }
  return response;
};
var buildPath = (path1, wild, search) => {
  let path = '';
  if (path1) path += `${path1}/`;
  if (wild) path += `${wild}/`;
  if (search) path += `${search}`;
  return path;
};

// src/testing.ts
var testing = async (request, context) => {
  const {
    params: { path1, wild },
    url: { hostname, search },
  } = context;
  const fullPath = buildPath2(path1, wild, search);
  const response = await fetch('https://wf.finsweet.com/2020');
  if (response.redirected && response.url) {
    return u(301, {}, { location: response.url });
  }
  return response;
};
var buildPath2 = (path1, wild, search) => {
  let path = '';
  if (path1) path += `${path1}/`;
  if (wild) path += `${wild}/`;
  if (search) path += `${search}`;
  return path;
};

// src/index.ts
var API = new _();
API.prepare = R((_2, context) => {
  context.timestamp = Date.now();
  context.defer((res) => {
    const ms = Date.now() - context.timestamp;
    res.headers.set('x-response-time', ms);
  });
});
API.add('GET', '/', handler);
API.add('GET', '/testing', testing);
API.add('GET', '/testing/*', testing);
API.add('GET', '/testing/:path1', testing);
API.add('GET', '/testing/:path1/*', testing);
API.add('GET', '/:path1', handler);
API.add('GET', '/:path1/*', handler);
var src_default = e(API.run);
export { src_default as default };
