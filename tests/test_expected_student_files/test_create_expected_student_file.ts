import CreateExpectedStudentFile, { CreateExpectedStudentFileData } from '@/components/expected_student_files/create_expected_student_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    ExpectedStudentFile, ExpectedStudentFileData,
    NewExpectedStudentFileData,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import {
    patch_async_static_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
   sinon.restore();
});

describe('CreateExpectedStudentFile tests', () => {
    let project_1: Project;
    let file_without_wildcard: ExpectedStudentFile;
    let file_with_wildcard: ExpectedStudentFile;
    let wrapper: Wrapper<CreateExpectedStudentFile>;
    let create_expected_student_file: CreateExpectedStudentFile;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        project_1 = new Project({
            pk: 10,
            name: "Detroit Zoo",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        file_without_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "filename.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        file_with_wildcard = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "filename*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    async function create_file_fields_equal(created_file: ExpectedStudentFile,
                                            expected_value_for_pattern: string,
                                            expected_value_for_min: string,
                                            expected_value_for_max: string) {
        expect(created_file.pattern).toEqual(expected_value_for_pattern);
        expect(created_file.min_num_matches).toEqual(expected_value_for_min);
        expect(created_file.max_num_matches).toEqual(expected_value_for_max);
    }


    // this test is producing the error: Error in event handler for "form_validity_changed":
    // "TypeError: Cannot read property '_transitionClasses' of undefined"
    test('No wildcard present in filename and exact match was true upon creation', async () => {
        // let create_spy = sinon.spy(ExpectedStudentFile, 'create');

        let fake_create = sinon.fake();
        sinon.replace(ExpectedStudentFile, 'create', fake_create);

        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "Giraffe.cpp";
        filename.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(true);
        wrapper.find("#create-expected-student-file-form").trigger('submit.native');
        await create_expected_student_file.$nextTick();

        expect(
            fake_create.getCall(0).args[1]
        ).toEqual({
            pattern: "Giraffe.cpp",
            min_num_matches: 1,
            max_num_matches: 1
        });
        expect(create_expected_student_file.d_new_expected_student_file.pattern).toEqual("");
        expect(create_expected_student_file.d_new_expected_student_file.min_num_matches).toEqual(1);
        expect(create_expected_student_file.d_new_expected_student_file.max_num_matches).toEqual(1);
    });

    // // no wildcard present but exact match was false
    // test.skip('No shell wildcard present in filename but exact match was set to false ' +
    //           'upon creation',
    //           async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "ostrich*.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     (<HTMLInputElement> filename.element).value = "llama.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     // take in a function to verify the two parameters were turned into 1's
    //     return patch_async_static_method(
    //         ExpectedStudentFile,
    //         'create',
    //         () => Promise.resolve(),
    //         async () => {
    //
    //         wrapper.find("#create-expected-student-file-form").trigger('submit.native');
    //         await create_expected_student_file.$nextTick();
    //     });
    // });
    //
    // // no wildcard present and exact match was true
    // test.skip('Shell wildcard present in filename upon creation ',
    //           async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "ostrich.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     // take in a function to verify the two parameters were turned into 1's
    //     return patch_async_static_method(
    //         ExpectedStudentFile,
    //         'create',
    //         () => Promise.resolve(),
    //         async () => {
    //
    //         wrapper.find("#create-expected-student-file-form").trigger('submit.native');
    //         await create_expected_student_file.$nextTick();
    //     });
    // });
    //
    test('400 error pattern not unique', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Expected student file with this Pattern and Project already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "Zebra.cpp";
        filename.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        return patch_async_static_method(
            ExpectedStudentFile,
            'create',
            () => Promise.reject(axios_response_instance),
            async () => {

            wrapper.find("#create-expected-student-file-form").trigger('submit.native');
            await create_expected_student_file.$nextTick();

            expect(create_expected_student_file.api_errors.length).toBeGreaterThan(0);
            expect(create_expected_student_file.api_error_present).toBe(true);
        });
    });

    test('Error pattern is blank', async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "   ";
        filename.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(false);
    });

    test('Error min_num_matches is blank',  async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        // select shell_wildcard
        let wildcard_radio_button = wrapper.find({ref: 'not_exact_match'});
        wildcard_radio_button.element.selected = true;
        wildcard_radio_button.trigger('change');
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "min_matches"}).vm;

        let min_matches = wrapper.find({ref: 'min_matches'}).find('#input');
        (<HTMLInputElement> min_matches.element).value = "";
        min_matches.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(false);
    });

    test('Error min_num_matches is negative', async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        // select shell_wildcard
        let wildcard_radio_button = wrapper.find({ref: 'not_exact_match'});
        wildcard_radio_button.element.selected = true;
        wildcard_radio_button.trigger('change');
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "min_matches"}).vm;

        let min_matches = wrapper.find({ref: 'min_matches'}).find('#input');
        (<HTMLInputElement> min_matches.element).value = "-1";
        min_matches.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(false);
    });
    //
    // // RangeError: Maximum call stack size exceeded
    // // cannot destroy wrapper because it is undefined
    test('Error max_num_matches is blank', async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        create_expected_student_file = wrapper.vm;
        await create_expected_student_file.$nextTick();

        // select not exact match
        let wildcard_radio_button = wrapper.find({ref: 'not_exact_match'});
        wildcard_radio_button.element.selected = true;
        wildcard_radio_button.trigger('change');
        await create_expected_student_file.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "max_matches"}).vm;


        let max_matches = wrapper.find({ref: 'max_matches'}).find('#input');
        (<HTMLInputElement> max_matches.element).value = " ";
        max_matches.trigger('input');
        await create_expected_student_file.$nextTick();

        expect(validated_input.is_valid).toBe(false);
    });
    //
    // // if you make max matches less than min matches - an error appears
    // // you then make min matches less than max
    // // max still has error until you change the value for max.
    //
    // // its also possible to make max matches less than min matches by first changing max
    // // then changing min to be something greater than max
    // test('Error max_num_matches is less than min_num_matches', async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let wildcard_radio_button = wrapper.find({ref: 'not_exact_match'});
    //     wildcard_radio_button.element.selected = true;
    //     wildcard_radio_button.trigger('change');
    //     await create_expected_student_file.$nextTick();
    //
    //     let min_matches_validated = <ValidatedInput> wrapper.find({ref: "min_matches"}).vm;
    //     let max_matches_validated = <ValidatedInput> wrapper.find({ref: "max_matches"}).vm;
    //
    //     let min_matches = wrapper.find({ref: 'min_matches'}).find('#input');
    //     (<HTMLInputElement> min_matches.element).value = "2";
    //     min_matches.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(min_matches_validated.is_valid).toBe(true);
    //
    //     let max_matches = wrapper.find({ref: 'max_matches'}).find('#input');
    //     (<HTMLInputElement> max_matches.element).value = "1";
    //     max_matches.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(max_matches_validated.is_valid).toBe(false);
    // });
    //
    // // This test prompts the error - Error in event handler for "form_validity_changed":
    // // "TypeError: Cannot read property '$options' of undefined"
    // test('wildcard_is_present is true when pattern contains shell wildcard chars', async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     // TypeError: Cannot read property '_transitionClasses' of undefined
    //     // expected_file_pattern.d_new_expected_student_file.pattern = "Flamingo*.cpp";
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "Flamingo*.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(create_expected_student_file.wildcard_is_present()).toBe(true);
    // });
    //
    // test.skip('exact_match set to false and cannot change when wildcard_is_present becomes' +
    //           ' true',
    //           async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "camels!!!.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(create_expected_student_file.exact_match).toBe(false);
    //     expect(create_expected_student_file.wildcard_is_present).toBe(true);
    //
    //     let wildcard_radio_button = wrapper.find({ref: 'exact_match'});
    //     wildcard_radio_button.element.selected = true;
    //     wildcard_radio_button.trigger('change');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(create_expected_student_file.exact_match).toBe(false);
    // });
    //
    // test.skip('min and max num matches editable when is_wildcard and exact_match are false',
    //           async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "rhino*.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(create_expected_student_file.wildcard_is_present()).toBe(true);
    //     expect(wrapper.findAll({ref: 'min_matches'}).length).toEqual(1);
    //     expect(wrapper.findAll({ref: 'max_matches'}).length).toEqual(1);
    // });
    //
    // test.skip('min and max num matches not editable when wildcard_is_present is false and exact ' +
    //           'match is true',
    //           async () => {
    //     wrapper = mount(CreateExpectedStudentFile, {
    //         propsData: {
    //             project: project_1
    //         }
    //     });
    //
    //     create_expected_student_file = wrapper.vm;
    //     await create_expected_student_file.$nextTick();
    //
    //     let filename = wrapper.find({ref: 'filename'}).find('#input');
    //     (<HTMLInputElement> filename.element).value = "polar_bear.cpp";
    //     filename.trigger('input');
    //     await create_expected_student_file.$nextTick();
    //
    //     expect(create_expected_student_file.wildcard_is_present()).toBe(false);
    //     expect(wrapper.findAll({ref: 'min_matches'}).length).toEqual(0);
    //     expect(wrapper.findAll({ref: 'max_matches'}).length).toEqual(0);
    // });
});
