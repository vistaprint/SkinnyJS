/* globals _, dependencyTree */

(function($, tree)
{

// Build a reverse lookup tree to find dependent modules
var treeRev = (function(tree)
{
	var rev = {};

	for (var prop in tree)
	{
		var deps = tree[prop].deps;
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
	if (moduleDeps && moduleDeps.deps.length > 0)
	{
		for (var i=0; i<moduleDeps.deps.length; i++)
		{
			buildDeps(moduleDeps.deps[i], deps);
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

var getLicense = function(modules, requiredModules)
{
	return "/*! skinny.js v0.0.1 | Copyright 2013 Laban Eilers | labaneilers.github.io/SkinnyJS/LICENSE \n" +
		"http://labaneilers.github.io/SkinnyJS/download-builder.html?modules=" + modules.join(",") + 
		"*/\n\n";
};

var outputTemplate = _.template($("#outputTemplate").html());
var buildModuleOutput = function(module)
{
	return outputTemplate(module);
};

var generate = function()
{
	var requestedModules = $("form[name=dependencies] input:checked").map(
		function(i, el)
		{
			return unescapeModuleName(el.value);
		});

	if (requestedModules.length === 0)
	{
		window.alert("Please select at least one module.");
		return;
	}

	var $outputArea = $("#outputArea");
	$outputArea.empty();

	var moduleNames = buildDepsMultiple(requestedModules);

	var allContent = {};

	var promises = _.map(moduleNames, function(moduleName) 
	{
		return $.ajax({ url: "dist-pub/" + moduleName + ".min.js", dataType: "text"})
			.then(function(responseText) 
			{
				var module = tree[moduleName];
				allContent[moduleName] = { 
					name: moduleName,
					content: responseText,
					single: module.single, 
					notes: module.notes
				};
			});
	});

	$.when.apply(null, promises).then(function()
	{
		// Get content objects for all modules
		var allModuleContent = _.map(moduleNames, function(moduleName)
		{
			return allContent[moduleName];
		});

		var concatableContent = _.filter(allModuleContent, function(moduleContent)
		{
			return !moduleContent.single;
		});

		var concatableContentNames = _.map(concatableContent, function(moduleContent)
		{
			return moduleContent.name;
		});

		// Filter down to just the non-single modules, then concatenate them
		// to create a final downloaded file
		var finalContent = 
			getLicense(concatableContentNames) + 
			_.map(concatableContent, function(moduleContent)
			{
				return moduleContent.content;
			})
			.join(";");

		var html = buildModuleOutput({ name: "skinny.js main module", notes: "", content: finalContent });

		var $form = $("form[name='dependencies']"); 

		// Emit text for single content modules: files that should not be aggregated
		var singleContent = _.chain(allModuleContent)
			.filter(function(moduleContent)
			{
				return moduleContent.single;
			})
			.each(function(moduleContent)
			{
				var content = getLicense([moduleContent.name]) + moduleContent.content;
				html +=
					"<div class='module-title'>" + moduleContent.name + "</div>" + 
					"<div class='module-notes'>" + (moduleContent.notes || "") + "<div>" +
					"<textarea class='module-output'>" + content + "</textarea>";
			});

		$outputArea.html(html);
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
