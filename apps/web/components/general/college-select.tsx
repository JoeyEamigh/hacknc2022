import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { classes, truncateCollegeName } from 'shared';
import { getSelectedCollege, saveSelectedCollege } from '../../scripts/storage';
import { useRouter } from 'next/router';

export default function CollegeSelect() {
  const [selected, setSelected] = useState<{ name: string; id: string }>(null);
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => setColleges(data));
  }, []);

  useEffect(() => {
    (async () => {
      const selected = await getSelectedCollege();
      setSelected(colleges.find(college => college.id === selected));
    })();
  }, [colleges]);

  if (!colleges.length || !selected) return null;

  async function selectCollege(college: { id: string; name: string }) {
    await fetch('/api/colleges', { method: 'POST', body: JSON.stringify({ id: college.id }) });
    console.log(college.id);
    await saveSelectedCollege(college.id);
    router.reload();
  }
  return (
    <Listbox value={selected} onChange={selectCollege}>
      {({ open }) => (
        <>
          <div className="relative mr-2 hidden w-full px-4 lg:block lg:w-auto">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">{truncateCollegeName(selected.name)}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {colleges.map(college => (
                  <Listbox.Option
                    key={college.id}
                    className={({ active }) =>
                      classes(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                      )
                    }
                    value={college}>
                    {({ selected, active }) => (
                      <>
                        <span className={classes(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {truncateCollegeName(college.name)}
                        </span>

                        {selected ? (
                          <span
                            className={classes(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                            )}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
