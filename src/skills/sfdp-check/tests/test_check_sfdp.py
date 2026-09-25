import argparse
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('sfdp', Path(__file__).parents[1] / 'scripts/check_sfdp.py')
sfdp = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = sfdp
spec.loader.exec_module(sfdp)

KEYS = {'mainnetBetaPubkey': '11111111111111111111111111111111',
        'testnetPubkey': 'So11111111111111111111111111111111111111112'}

def fleet():
    return {'version': 1, 'groups': {'example': KEYS}, 'hosts': []}

class FleetTests(unittest.TestCase):
    def load(self, data):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fleet.json'
            path.write_text(json.dumps(data))
            return sfdp.load_fleet(str(path))

    def test_pairs_must_match_both_identities(self):
        wrong = {**KEYS, 'testnetPubkey': KEYS['mainnetBetaPubkey'], 'state': 'Approved'}
        self.assertIsNone(sfdp.find_participant([wrong], KEYS))
        right = {**KEYS, 'state': 'Approved'}
        self.assertEqual(sfdp.find_participant([right], KEYS), right)
        with self.assertRaisesRegex(RuntimeError, 'Ambiguous'):
            sfdp.find_participant([right, right], KEYS)

    def test_fleet_validation_and_no_private_default(self):
        self.assertEqual(self.load(fleet()), ({'example': KEYS}, []))
        for data in [{}, {**fleet(), 'version': True}, {**fleet(), 'rpcUrl': 'secret'}, {**fleet(), 'groups': {}},
                     {**fleet(), 'groups': {'example': {**KEYS, 'testnetPubkey': ['bad']}}}]:
            with self.assertRaises(ValueError): self.load(data)
        with self.assertRaisesRegex(ValueError, 'ONBOARDING_REQUIRED'):
            sfdp.load_fleet('/nonexistent/sfdp-test.json')

    def test_ssh_option_injection_and_identity_drift_rejected(self):
        host = dict(group='example', cluster='mainnet-beta', host='my-validator', rpc_port=8899,
                    client='agave', expected_identity=KEYS['mainnetBetaPubkey'], vote_account='', role='primary')
        self.assertEqual(len(self.load({**fleet(), 'hosts': [host]})[1]), 1)
        for patch_fields in [{'host': '-oProxyCommand=evil'}, {'rpc_port': True},
                             {'expected_identity': KEYS['testnetPubkey']}, {'client': 'typo'}]:
            with self.assertRaises(ValueError): self.load({**fleet(), 'hosts': [{**host, **patch_fields}]})

    def test_empty_requirements_do_not_pass(self):
        with patch.object(sfdp, 'load_fleet', return_value=({'example': KEYS}, [])), \
             patch.object(sfdp, 'fetch_json', return_value={'data': []}):
            with self.assertRaisesRegex(RuntimeError, 'required-version'):
                sfdp.collect(argparse.Namespace(fleet='fixture',api_only=True,timeout=1,current_only=False))
        self.assertFalse(sfdp.check_version('3.0.0', {}, 'agave')[0])

    def test_malformed_versions_cannot_pass(self):
        for version in ['unknown', '', '3.x.0', '3.0.0 garbage', None]:
            with self.assertRaises(ValueError): sfdp.compare_versions(version, '3.0.0')
        self.assertEqual(sfdp.compare_versions('3.0.0+build.1','3.0.0'), 0)

    def test_version_boundaries_and_prerelease(self):
        requirement = {'agave_min_version': '3.0.0', 'agave_max_version': '3.1.0'}
        for version in ['3.0.0','3.1.0']: self.assertTrue(sfdp.check_version(version,requirement,'agave')[0])
        for version in ['3.0.0-rc.1','3.1.1']: self.assertFalse(sfdp.check_version(version,requirement,'agave')[0])

if __name__ == '__main__': unittest.main()
