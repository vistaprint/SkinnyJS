

(function($, tree)
{

var treeRev = (function(tree)
{
	var rev = {};

	for (var prop in tree)
	{
		var deps = tree[prop];
		for (var i=0; i<deps.length; i++)
		{
			if (!rev[deps[i]])
			{
				rev[deps[i]] = [];
			}
			rev[deps[i]].push(prop);
		}
	}

	return rev;

})(tree);

var buildDeps = function(moduleName, deps)
{
	if (!deps)
	{
		deps = [];
	}

	var moduleDeps = tree[moduleName];
	if (moduleDeps && moduleDeps.length > 0)
	{
		for (var i=0; i<moduleDeps.length; i++)
		{
			buildDeps(moduleDeps[i], deps);
		}
	}

	deps.push(moduleName);

	return deps;
};

var buildDepsRev = function(moduleName, deps)
{
	if (!deps)
	{
		deps = [];
	}

	var moduleDeps = treeRev[moduleName];
	if (moduleDeps && moduleDeps.length > 0)
	{
		for (var i=0; i<moduleDeps.length; i++)
		{
			buildDepsRev(moduleDeps[i], deps);
		}
	}

	deps.push(moduleName);

	return deps;
};

var buildDepsMultiple = function(moduleNames)
{
	var deps = [];

	_.each(moduleNames, function(moduleName)
	{
		buildDeps(moduleName, deps);
	});

	var finalDeps = [];
	var used = {};
	for (var i=0; i<deps.length; i++)
	{
		if (!used[deps[i]])
		{
			used[deps[i]] = true;
			finalDeps.push(deps[i]);
		}
	}

	return finalDeps;
};

var unescapeModuleName = function(escaped)
{
	return escaped.replace("_", ".");
};

var escapeModuleName = function(unescaped)
{
	return unescaped.replace(/\./, "_");
};

var generate = function()
{
	var requestedModules = $("form[name=dependencies] input:checked").map(
		function(i, el)
		{
			return unescapeModuleName(el.value);
		});

	var moduleNames = buildDepsMultiple(requestedModules);

	var content = {};

	var promises = _.map(moduleNames, function(moduleName) {
		return $.get("dist/" + moduleName + ".min.js").promise().then(function(responseText) 
		{
			content[moduleName] = responseText;
		});
	});

	var license = "/*! skinny.js v0.0.1 | Copyright 2013 Laban Eilers | labaneilers.github.io/SkinnyJS/LICENSE \n" +
		"http://labaneilers.github.io/SkinnyJS/download-builder.html?modules=" + moduleNames.join(",") + 
		"*/\n\n";

	$.when.apply(null, promises).then(function()
	{
		var temp = promises;
		var finalContent = license + _.map(moduleNames, function(moduleName)
		{
			return content[moduleName];
		}).join(";");

		$("#output").html(finalContent);
	});
};


var updateUI = function()
{
	var moduleName = unescapeModuleName(this.value);
	
	if (this.checked)
	{
		var deps = buildDeps(moduleName);
		deps.forEach(function(dep)
		{
			$("#" + escapeModuleName(dep)).prop("checked", true);
		});
	}
	else
	{
		var depsRev = buildDepsRev(moduleName);
		depsRev.forEach(function(dep)
		{
			$("#" + escapeModuleName(dep)).prop("checked", false);
		});
	}
};

var buildUI = function()
{
	// Generate checkboxes for each dependency via a template
	var template = $("#dependencyTemplate").html();

	var html = _.keys(tree).map(function(moduleName)
	{
		return _.template(template, { escapedModuleName: escapeModuleName(moduleName), moduleName: moduleName });	
	});

	$(".dependencies-container").prepend(html.join("\n"));

	$(".generate-button").click(generate);

	$(".dependencies-container input[type=checkbox]").click(updateUI);

	var modulesQs = $.currentQueryString()["modules"];
	if (modulesQs)
	{
		_.each(modulesQs.split(","), function(moduleName)
		{
			$("#" + escapeModuleName(moduleName)).prop("checked", true);
		});
	}
	
};

$(document).on("ready", buildUI);

})(jQuery, dependencyTree);
