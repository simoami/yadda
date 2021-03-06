if (!module.client) {
	var fs = require('fs');
}
var English = require('../localisation/English');
var FeatureParser = require('../parsers/FeatureParser');
var $ = require('../Array');

module.exports = function(options) {

    var options = options || {};
    var language = options.language || English;
    var parser = options.parser || new FeatureParser(language);
    var mode = options.mode || 'async';

    if (options.deprecation_warning != false) {
        console.log('The MochaPlugin is deprecated as of 0.10.0 and will be removed in 0.12.0');
        console.log('Replace it with one of AsyncScenarioLevelPlugin, SyncScenarioLevelPlugin, AsyncStepLevelPlugin or SyncStepLevelPlugin');
        console.log('To disable this message use Yadda.plugins.mocha({deprecation_warning: false})');
        console.log('See the readme for more details')        
    }

	if (module.client) {
		var feature = function (text, next) {
			parser.parse(text, function(feature) {
				var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
				_describe(feature.title || filename, function() {
					next(feature)
				});
			});
		};
	} else {
		var feature = function (filenames, next) {
			$(filenames).each(function(filename) {
				var text = fs.readFileSync(filename, 'utf8');
				parser.parse(text, function(feature) {
					var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
					_describe(feature.title || filename, function() {
						next(feature)
					});
				});
			});
		};
	}

    function async_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function(done) {
                next(scenario, done)
            });
        });
    };

    function sync_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function() {
                next(scenario)
            });
        });
    };

	if (typeof GLOBAL !== 'undefined') {
		GLOBAL.features = GLOBAL.feature = feature;
		GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
	}

	if (typeof window !== 'undefined') {
		window.features = window.feature = feature;
		window.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
	}
};
