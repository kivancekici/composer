/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Logger = require('composer-common').Logger;
const Registry = require('./registry');
const util = require('util');

const LOG = Logger.getLog('EngineQueries');

/**
 * The JavaScript engine responsible for processing chaincode commands.
 * @protected
 * @memberof module:composer-runtime
 */
class EngineQueries {

    /**
     * Execute a query.
     * @param {Context} context The request context.
     * @param {string[]} args The arguments to pass to the chaincode function.
     * @return {Promise} A promise that will be resolved when complete, or rejected
     * with an error.
     */
    executeQuery(context, args) {
        const method = 'executeQuery';
        LOG.entry(method, context, args);
        if (args.length !== 3) {
            LOG.error(method, 'Invalid arguments', args);
            throw new Error(util.format('Invalid arguments "%j" to function "%s", expecting "%j"', args, 'executeQuery', ['queryType', 'query', 'parameters']));
        }

        // Process the parameters.
        const queryType = args[0], query = args[1], parametersAsJSON = args[2];
        LOG.debug(method, 'queryType', queryType);

        // Validate the query type.
        if (queryType !== 'build' && queryType !== 'named') {
            throw new Error(util.format('Invalid argument "queryType" with value "%s", expecting "build" or "named"', [queryType]));
        }

        // Build the query if necessary.
        let identifier;
        if (queryType === 'build') {
            identifier = context.getCompiledQueryBundle().buildQuery(query);
        } else {
            identifier = query;
        }

        // Parse the parameters.
        const parameters = JSON.parse(parametersAsJSON);

        // Execute the query.
        const dataService = context.getDataService();
        const serializer = context.getSerializer();
        const accessController = context.getAccessController();
        return context.getCompiledQueryBundle().execute(dataService, identifier, parameters)
            .then((objects) => {
                return objects.map((object) => {
                    object = Registry.removeInternalProperties(object);
                    return serializer.fromJSON(object);
                }).reduce((resources, resource) => {
                    return resources.then((resources) => {
                        return accessController.check(resource, 'READ')
                            .then(() => {
                                resources.push(resource);
                                return resources;
                            })
                            .catch((error) => {
                                return resources;
                            });
                    });
                }, Promise.resolve([]));
            })
            .then((resources) => {
                resources = resources.map((resource) => {
                    return serializer.toJSON(resource);
                });
                LOG.exit(method, resources);
                return resources;
            });

    }

}

module.exports = EngineQueries;
